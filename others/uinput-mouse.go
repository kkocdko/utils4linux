package main
import "time"
import "gopkg.in/bendahl/uinput.v1"
func main() {
  mouse, err := uinput.CreateMouse("/dev/uinput", []byte("testmouse"))
  if err != nil {
    panic(err)
  }
  defer mouse.Close()
  time.Sleep(time.Millisecond * 5000)
	mouse.LeftPress()
  for{

  time.Sleep(time.Millisecond * 5000)
  }
}
// CGO_ENABLED=0 go build --ldflags "-s -w" main.go ; sudo ./main
