package main
import "time"
import "gopkg.in/bendahl/uinput.v1"
func main() {
  mouse, err := uinput.CreateMouse("/dev/uinput", []byte("testmouse"))
  if err != nil {
    panic(err)
  }
  defer mouse.Close()
  for {
    time.Sleep(time.Millisecond * 500)
    mouse.Wheel(false, -3) // wheel down
    time.Sleep(time.Millisecond * 500)
    mouse.Wheel(false, 3) // wheel up
  }
}
// CGO_ENABLED=0 go build --ldflags "-s -w" main.go ; sudo ./main
