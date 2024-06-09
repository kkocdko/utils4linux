package main

import (
	"bufio"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"math/big"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

var matchList = []string{
	"v2ex.com",
	"github.com",
	"github.io",
	"githubusercontent.com",
	// "wikipedia.org",
	// "reddit.com",
	// "pornhub.com",
	"pixiv.net",
}

var dnsList = []string{
	"https://1.1.1.1/dns-query",
	"https://1.0.0.1/dns-query",
	"https://8.8.8.8/resolve",
	"https://8.8.4.4/resolve",
	"https://223.6.6.6/resolve",
	"https://223.5.5.5/resolve",
	"https://1.12.12.12/resolve",
	"https://120.53.53.53/resolve",
}

func dnsQuery(dns, name, recordType string) ([]string, error) {
	req, _ := http.NewRequest("GET", dns+"?name="+name+"&type="+recordType, nil)
	req.Header.Set("Accept", "application/dns-json")
	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	data := map[string]any{}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}
	ret := []string{}
	answers, ok := data["Answer"].([]any)
	if !ok {
		return nil, errors.New("get answer from response failed")
	}
	for _, v := range answers {
		answer := v.(map[string]any)
		if answer["type"] == 1.0 || answer["type"] == 28.0 {
			ret = append(ret, answer["data"].(string))
		}
	}
	if len(ret) == 0 {
		return nil, errors.New("query returns empty")
	}
	return ret, nil
}

// var dnsCache sync.Map

func connFast(host, port string) (net.Conn, error) {
	conns := make(chan net.Conn, 4)
	var ipUsed sync.Map
	for _, d := range dnsList {
		for _, t := range []string{"A", "AAAA"} {
			go func(d, t string) {
				ips, err := dnsQuery(d, host, t)
				if err != nil {
					return
				}
				for _, ip := range ips {
					_, used := ipUsed.LoadOrStore(ip, true)
					if used {
						continue
					}
					go func(ip string) {
						conn, err := net.DialTimeout("tcp", ip+":"+port, time.Second*10)
						if err != nil {
							return
						}
						conns <- conn
					}(ip)
				}
			}(d, t)
		}
	}
	conn, _ := <-conns
	fmt.Printf("[info] resolve %v -> %v\n", host, conn.RemoteAddr().String())
	return conn, nil
}

const caCert = "/home/kkocdko/.local/share/mkcert/rootCA.pem"
const caKey = "/home/kkocdko/.local/share/mkcert/rootCA-key.pem"

var caParent *x509.Certificate
var caPrivKey any

func panicErr(v error, msg ...string) {
	if v != nil {
		if len(msg) != 0 {
			fmt.Println(msg[0])
		}
		panic(v)
	}
}

func assert(v bool, msg ...string) {
	if !v {
		panicErr(errors.New("assert false"), msg[0])
	}
}

var certCache sync.Map

func getCertificate(info *tls.ClientHelloInfo) (*tls.Certificate, error) {
	assert(info.ServerName != "")
	cn := info.ServerName
	if cert, ok := certCache.Load(cn); ok {
		return cert.(*tls.Certificate), nil
	}
	priv, _ := rsa.GenerateKey(rand.Reader, 2048)
	serialNumber, _ := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	template := &x509.Certificate{
		// Subject:               pkix.Name{CommonName: cn, Country: []string{"CN"}},
		SerialNumber:          serialNumber,
		NotBefore:             time.Now().Add(time.Hour * 24 * -14), // before 2 weeks
		NotAfter:              time.Now().Add(time.Hour * 24 * 90),  // after 3 months
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		DNSNames:              []string{cn},
	}
	derBytes, err := x509.CreateCertificate(rand.Reader, template, caParent, priv.Public(), caPrivKey)
	panicErr(err)
	cert := &tls.Certificate{Certificate: [][]byte{derBytes}, PrivateKey: priv}
	certCache.Store(cn, cert)
	return cert, nil
}

func handleAccept(acceptConn net.Conn) {
	// defer client.Close()
	req, err := http.ReadRequest(bufio.NewReader(acceptConn))
	// fmt.Printf("req.URL: %v\n", req.URL.String())
	// fmt.Printf("req.Body: %v\n", req.Body) // 是否会 read 进 body？有疑问
	panicErr(err)
	address := req.URL.Host
	if req.Method == "CONNECT" {
		// 使用 https，需先向客户端表示连接建立完毕
		acceptConn.Write([]byte("HTTP/1.1 200 Connection established\r\n\r\n"))
		host, port, err := net.SplitHostPort(address)
		panicErr(err)

		matched := false
		for _, v := range matchList {
			if host == v || strings.HasSuffix(host, "."+v) {
				matched = true
				break
			}
		}

		// 直接访问目标服务器 如果 未匹配 / 非 443 端口 / 使用 IP 访问
		if !matched || port != "443" || net.ParseIP(host) != nil {
			remoteConn, err := net.Dial("tcp", address)
			if err != nil {
				fmt.Printf("[warn] err: %v\n", err)
				return
			}
			go io.Copy(remoteConn, acceptConn)
			go io.Copy(acceptConn, remoteConn)
			return
		}
		fmt.Printf("[info] host: %v\n", host)
		config := &tls.Config{
			InsecureSkipVerify: true,
			VerifyPeerCertificate: func(rawCerts [][]byte, _ [][]*x509.Certificate) error {
				// bypass tls verification and manually do it
				certs := make([]*x509.Certificate, len(rawCerts))
				for i, asn1Data := range rawCerts {
					cert, _ := x509.ParseCertificate(asn1Data)
					certs[i] = cert
				}
				opts := x509.VerifyOptions{
					DNSName:       host,
					Intermediates: x509.NewCertPool(),
				}
				for _, cert := range certs[1:] {
					opts.Intermediates.AddCert(cert)
				}
				_, err := certs[0].Verify(opts)
				if err != nil {
					fmt.Printf("[warn] err: %v\n", err)
				}
				return err
				// return err
			},
		}
		remoteConn, err := connFast(host, "443")
		if err != nil {
			fmt.Printf("[warn] err: %v\n", err)
			return
		}
		remoteTlsConn := tls.Client(remoteConn, config)
		midTlsConn := tls.Server(acceptConn, &tls.Config{GetCertificate: getCertificate})
		go io.Copy(remoteTlsConn, midTlsConn)
		go io.Copy(midTlsConn, remoteTlsConn)
	} else {
		if strings.IndexByte(address, ':') == -1 {
			address += ":80" // 不带端口， 默认 80
		}
		req.Header.Del("Proxy-Connection") // 别直接就告诉服务器说我是代理，那太傻了
		req.RequestURI = ""
		remoteConn, err := net.Dial("tcp", address)
		if err != nil {
			fmt.Printf("[warn] err: %v\n", err)
			return
		}
		panicErr(req.Write(remoteConn))
		go io.Copy(remoteConn, acceptConn)
		go io.Copy(acceptConn, remoteConn)
	}
}

func main() {
	// read ca cert
	certData, err := os.ReadFile(caCert)
	panicErr(err)
	certBlock, _ := pem.Decode(certData)
	caParent, err = x509.ParseCertificate(certBlock.Bytes)
	panicErr(err)
	keyData, err := os.ReadFile(caKey)
	panicErr(err)
	keyBlock, _ := pem.Decode(keyData)
	caPrivKey, err = x509.ParsePKCS8PrivateKey(keyBlock.Bytes)
	panicErr(err)

	// tcp 连接，监听 8080 端口
	listener, err := net.Listen("tcp", ":8080")
	panicErr(err)
	for {
		acceptConn, err := listener.Accept()
		panicErr(err)
		go handleAccept(acceptConn)
	}
}
