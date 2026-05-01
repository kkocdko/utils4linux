#ifdef __linux__

// g++ -o macros -Og macros.cc

// clang-format off
/*
pw-loopback --name="pw-loopback-1" --capture-props="media.class=Audio/Sink" --playback-props="media.class=Audio/Source"
pw-record -v --rate 16000 --channels 1 --channel-map mono --format s16 --target "input.pw-loopback-1:monitor_0" - > /tmp/record.wav
pw-cli list-objects | grep pw-loop
pw-record -v --rate 16000 --channels 1 --channel-map mono --format s16 - > /tmp/record.wav
pw-record -v --rate 16000 --channels 1 --channel-map mono --format s16 --target "input.pw-loopback-1:monitor_0" - > /tmp/record.wav
*/
// clang-format on

#include <functional>

#include <fcntl.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include <linux/uinput.h>

// Required includes for pw_record_main
#include <errno.h>    // For errno
#include <spawn.h>    // For posix_spawn, etc.
#include <sys/wait.h> // For waitpid

struct Defer { // use like golang's defer
  std::function<void()> cleanup;
  explicit Defer(std::function<void()> func) : cleanup(std::move(func)) {}
  ~Defer() { cleanup(); }
  Defer(const Defer &) = delete; // avoid double cleanup
  Defer &operator=(const Defer &) = delete;
};

static int uinput_fd = -1;

void uinput_emit(int type, int code, int val) {
  // timestamp values like tv_sec are ignored by uinput for EV_SYN
  input_event event = {};
  event.type = type;
  event.code = code;
  event.value = val;
  if (write(uinput_fd, &event, sizeof(event)) < 0) {
    perror("Failed to writing event");
  }
}

// --- BEGIN Embedded pw_record logic ---
int pw_record_main() {
  pid_t child_pid = -1;
  posix_spawn_file_actions_t file_actions;
  bool file_actions_initialized = false;
  int pipe_fds[2] = {-1, -1}; // pipe_fds[0] for read, pipe_fds[1] for write
  int ret = 0;                // 0 for success, 1 for any failure

  // Defer cleanup of file actions object
  Defer defer_file_actions([&]() {
    if (file_actions_initialized) {
      if (posix_spawn_file_actions_destroy(&file_actions) != 0) {
        perror("pw_record_main: posix_spawn_file_actions_destroy failed");
        // This failure doesn't change overall_status as main operations might
        // have succeeded
      }
    }
  });

  // Defer cleanup of pipe read end
  Defer defer_pipe_read_fd([&]() {
    if (pipe_fds[0] != -1) {
      if (close(pipe_fds[0]) == -1) {
        perror("pw_record_main: Defer: close(pipe_fds[0]) failed");
      }
    }
  });

  // Defer cleanup of pipe write end (parent's copy)
  Defer defer_pipe_write_fd([&]() {
    if (pipe_fds[1] != -1) {
      if (close(pipe_fds[1]) == -1) {
        perror("pw_record_main: Defer: close(pipe_fds[1]) failed");
      }
    }
  });

  const char *argv[] = {"pw-record", "--rate=8000", "--channels=1", "-", NULL};
  size_t argv_len = sizeof(argv) / sizeof(char *);
  char **argv_mut = (char **)malloc(sizeof(char *) * argv_len);
  for (size_t i = 0; i != argv_len; i++)
    argv_mut[i] = strdup(argv[i]);
  Defer defer_argv_mut([&]() {
    for (size_t i = 0; i != argv_len; i++)
      free(argv_mut[i]);
    free(argv_mut);
  });

  extern char **environ; // Use parent's environment
  int spawn_err;

  // Create a pipe for capturing child's stdout
  if (pipe(pipe_fds) == -1) {
    perror("pw_record_main: pipe failed");
    return 1; // Cannot proceed
  }

  // Initialize file actions
  if ((spawn_err = posix_spawn_file_actions_init(&file_actions)) != 0) {
    fprintf(stderr,
            "pw_record_main: posix_spawn_file_actions_init failed: %s\n",
            strerror(spawn_err));
    return 1; // Cannot proceed
  }
  file_actions_initialized = true;

  // Action: Duplicate pipe's write end to child's STDOUT_FILENO
  if ((spawn_err = posix_spawn_file_actions_adddup2(&file_actions, pipe_fds[1],
                                                    STDOUT_FILENO)) != 0) {
    fprintf(stderr,
            "pw_record_main: posix_spawn_file_actions_adddup2 failed: %s\n",
            strerror(spawn_err));
    return 1;
  }

  // Action: Close pipe's read end in the child process (it won't use it)
  if ((spawn_err = posix_spawn_file_actions_addclose(&file_actions,
                                                     pipe_fds[0])) != 0) {
    fprintf(stderr,
            "pw_record_main: posix_spawn_file_actions_addclose for pipe_fds[0] "
            "failed: %s\n",
            strerror(spawn_err));
    return 1;
  }

  // Spawn the child process "pw-record"
  printf("pw_record_main: Spawning\n");
  if ((spawn_err = posix_spawnp(&child_pid, argv_mut[0], &file_actions, NULL,
                                argv_mut, environ)) != 0) {
    fprintf(stderr, "pw_record_main: posix_spawnp failed for %s: %s\n",
            argv_mut[0], strerror(spawn_err));
    return 1;
  }
  printf("pw_record_main: Spawned child (pw-record) with PID: %d\n", child_pid);

  // Parent process: Close the write end of the pipe.
  // This is crucial so that read() on pipe_fds[0] will eventually return 0
  // (EOF) when the child closes its STDOUT (which is the other end of the
  // pipe).
  if (close(pipe_fds[1]) == -1) {
    perror("pw_record_main: Parent close(pipe_fds[1]) failed");
    ret = 1; // Log error, but continue to attempt reading if possible
  }
  pipe_fds[1] =
      -1; // Mark as closed (or attempted to close) by explicit parent logic

  // Read data from the child's stdout (via the pipe's read end)
  char buffer[4096];
  ssize_t bytes_read;
  printf("pw_record_main: Reading from child stdout...\n");
  while ((bytes_read = read(pipe_fds[0], buffer, sizeof(buffer))) > 0) {
    printf("pw_record_main: Read %zd bytes\n", bytes_read);
    // buffer contains the raw audio data from pw-record
    // Add processing here if needed
  }

  if (bytes_read == -1) { // Check for read error
    perror("pw_record_main: read from pipe failed");
    ret = 1;
  }

  // Parent process: Close the read end of the pipe.
  if (pipe_fds[0] != -1) { // Check if not already closed due to an error or by
                           // Defer (unlikely path here)
    if (close(pipe_fds[0]) == -1) {
      perror(
          "pw_record_main: Parent close(pipe_fds[0]) after read loop failed");
      ret = 1;
    }
    pipe_fds[0] = -1; // Mark as closed by explicit parent logic
  }

  // Wait for the child process to terminate and get its status
  int child_exit_status = 0;
  printf("pw_record_main: Waiting for child PID %d \n", child_pid);
  waitpid(child_pid, &child_exit_status, 0);

  return ret; // 0 if all went well, 1 if any issue occurred
}
// --- END Embedded pw_record logic ---

int main(int argc, char *argv[]) {

  int pw_record_ret = pw_record_main();
  if (pw_record_ret != 0) {
    printf("main: pw_record_main error = %d.\n", pw_record_ret);
  }

  return 0;
  // strcmp(argv[argc-1],"")
  uinput_fd = open("/dev/uinput", O_WRONLY | O_NONBLOCK);
  if (uinput_fd < 0) {
    perror("Failed to open /dev/uinput");
    return 1;
  }
  Defer defer_uinput_fd([&]() {
    if (ioctl(uinput_fd, UI_DEV_DESTROY) < 0) {
      perror("Failed to destroy uinput device");
    }
    close(uinput_fd);
    printf("The uinput device closed\n");
  });
  if (ioctl(uinput_fd, UI_SET_EVBIT, EV_KEY) < 0) {
    perror("Failed to configure, during enable mouse button event");
    return 1;
  }
  if (ioctl(uinput_fd, UI_SET_KEYBIT, BTN_LEFT) < 0) {
    perror("Failed to configure, during enable mouse left button");
    return 1;
  }
  if (ioctl(uinput_fd, UI_SET_EVBIT, EV_SYN) < 0) {
    perror("Failed to configure, during enable synchronization event");
    return 1;
  }
  uinput_setup usetup = {}; // setup device properties
  usetup.id.bustype = BUS_USB;
  usetup.id.vendor = 0x1234;  // example vendor
  usetup.id.product = 0x5678; // example product
  strcpy(usetup.name, "virtual_mouse_5678");
  if (ioctl(uinput_fd, UI_DEV_SETUP, &usetup) < 0) {
    perror("Failed to setup uinput device");
    close(uinput_fd);
    return 1;
  }
  if (ioctl(uinput_fd, UI_DEV_CREATE) < 0) {
    perror("Failed to create uinput device");
    close(uinput_fd);
    return 1;
  }

  sleep(1);

  uinput_emit(EV_KEY, BTN_LEFT, 1);   // 1 for press down
  uinput_emit(EV_SYN, SYN_REPORT, 0); // report the event
  printf("Mouse left button down\n");

  sleep(1);

  uinput_emit(EV_KEY, BTN_LEFT, 0);   // 0 for release up
  uinput_emit(EV_SYN, SYN_REPORT, 0); // report the event
  printf("Mouse left button up\n");

  sleep(1);

  return 0;
}

#elif _WIN32

int main() { return 0; }

#endif
