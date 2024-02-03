package main

import (
	_ "embed"
	"github.com/xmdhs/clash2singbox/convert"
	"github.com/xmdhs/clash2singbox/model/clash"
	"gopkg.in/yaml.v3"
	"unsafe"
)

//go:embed config.json.template
var configByte []byte

var buf [1024 * 512]byte

//export getBuffer
func getBuffer() *byte {
	return &buf[0]
}

//export setOutput
func setOutput(string)

//export translate
func translate(inPtr *byte, inSize uint32) {
	c := clash.Clash{}
	var singList []any
	var tags []string
	b := []byte(unsafe.String(inPtr, inSize))
	err := yaml.Unmarshal(b, &c)
	if err != nil {
		panic(err)
	}
	s, err := convert.Clash2sing(c)
	if err != nil {
		panic(err)
	}
	outb := configByte
	outb, err = convert.Patch(outb, s, "", "", singList, tags...)
	if err != nil {
		panic(err)
	}
	setOutput(string(outb))
}

func main() {}
