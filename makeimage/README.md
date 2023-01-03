# makeimage - utils4fedora

Build a custom Fedora image in docker.

```sh
setenforce 0
docker build -t makeimage .
docker run --network=host --privileged -v $(pwd):$(pwd) --name makeimage-0 makeimage $(pwd)/custom.ks $(pwd)/result --compression zstd

--compress-arg=-b,16M,-Xdict-size,128M,-no-recovery
# echo y | sudo docker container prune

--compress-arg
--anaconda-arg

--env HTTP_PROXY=http://192.168.43.82/ --env HTTPS_PROXY=http://192.168.43.82/

/var/log/squid/

luxury

```

```json
{
  "data-root": "/tmp/docker",
  "registry-mirrors": ["http://hub-mirror.c.163.com"],
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn/"]
}
```

## Troubleshooting

- livemedia-creator throws `Command '['losetup', ...]' returned non-zero ...`:

This is because the `/dev/loop0` was t

```sh
killall anaconda
rm -rf /var/run/anaconda.pid
rm -rf lmc-result
```

- livemedia-creator throws `Command '['unshare', ...]' returned non-zero ...`:

Just restart the container.

https://mirrors.fedoraproject.org/mirrorlist?repo=updates-released-f37&arch=x86_64
https://mirrors.fedoraproject.org/mirrorlist?repo=fedora-37&arch=x86_64
