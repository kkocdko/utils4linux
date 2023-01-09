# makeimage - utils4fedora

Build your custom Fedora 37 ISO with Docker.

## Usage

```sh
# sudo -i # or add sudo before every command
# setenforce 0 # if you get any errors like memory permission

# clone this repo
git clone --depth=1 https://github.com/kkocdko/utils4fedora

# build the docker image
docker build -t makeimage utils4fedora/makeimage

# build your custom fedora iso!
docker run --network=host --privileged -v $(pwd):$(pwd) --name mkimg0 makeimage \
    $(pwd)/utils4fedora/makeimage/custom.ks $(pwd)/result \
    --make-iso --iso-only --compression zstd --compress-arg=-b --compress-arg=1M --compress-arg=-Xcompression-level --compress-arg=22

# see what's produced
# ls -lh ./result/*
```

<!--
```sh
cd /tmp/lmc ; rm -rf * ; cp /home/kkocdko/misc/code/utils4fedora/makeimage/custom.test.ks .
docker kill mkimg0 ; docker rm mkimg0
docker run -it --network=host --privileged -v $(pwd):$(pwd) --name mkimg0 makeimage $(pwd)/custom.test.ks $(pwd)/result0 --make-iso --iso-only --compression zstd --compress-arg=-b --compress-arg=1M --compress-arg=-Xcompression-level --compress-arg=1

qemu-kvm -machine q35 -device qemu-xhci -device usb-tablet -cpu host -smp 4 -m 2G -cdrom /tmp/lmc/result0/boot.iso

docker cp mkimg0:/fedora-kickstarts/makeimage.ks ./mk.ks

LiveOS_rootfs

noxattrs is not bootable

docker run --network=host --privileged -v $(pwd):$(pwd) --name makeimage-0-0 -it --entrypoint /bin/bash makeimage-0

sudo docker run --network=host --privileged -v $(pwd):$(pwd) --name makeimage-0 -it --entrypoint /bin/bash makeimage

46.71 MB iwlax2xx-firmware

# --squashfs-only cause systemd-resolved failed
# --squashfs-only --anaconda-arg --compression lz4 --compress-arg=
# -processors 1
# -no-recovery -b 1M -Xdict-size 1M -Xbcj x86
# echo y | sudo docker container prune
# --env HTTP_PROXY=http://192.168.43.82/ --env HTTPS_PROXY=http://192.168.43.82/
vi /etc/docker/daemon.json

#!/bin/sh

exit

# ==============================

sudo sh -c "systemctl kill docker && rm -rf /tmp/docker && systemctl start docker"
sudo docker run --network=host --hostname docker --name makeimage --privileged=true --cap-add=SYS_ADMIN -d fedora:37 tail -f /dev/null
sudo docker exec -it makeimage bash

sudo livemedia-creator \
    --make-iso \
    --no-virt \
    --resultdir ./result \
    --ks makeimage.ks \
    --logfile livemedia-creator.log \
    --fs-label ultramarine-G-x86_64 \
    --project 'Ultramarine Linux' \
    --releasever 37 \
    --release 1.0 \
    --iso-only \
    --iso-name aa.iso

# sudo livemedia-creator --make-tar --no-virt --resultdir build/image --ks build/docker-minimal-flattened.ks --logfile build/logs/livemedia-creator.log --fs-label ultramarine-D-x86_64 --project Ultramarine Linux --releasever 37 --isfinal --release 1.0 --variant docker-minimal --image-name ultramarine-docker.tar.xz --nomacboot


# ==============================

sudo vi /etc/docker/daemon.json
sudo systemctl restart docker
sudo docker pull fedora:37
sudo docker rename $(sudo docker run --network=host --privileged -h docker -d fedora:37 /sbin/init) fedora-livecd-util
sudo docker exec -it fedora-livecd-util bash

sudo dnf install osbuild-composer composer-cli -y

dnf install lorax -y

# ==============================

dnf install livecd-tools spin-kickstarts

# ==============================

sudo docker rename $(sudo docker run --network=host --privileged -h docker -d httpd tail -f /dev/null) fedora1
sudo docker exec -it fedora1 bash

sudo docker run -d --tmpfs /tmp --tmpfs /run -v /sys/fs/cgroup:/sys/fs/cgroup:ro osmaker

sudo docker run -it --name u0 ubuntu bash
sudo docker exec -it xxxx bash


sudo docker run --name osmaker1 -d --tmpfs /tmp --tmpfs /run -v /sys/fs/cgroup:/sys/fs/cgroup:ro osmaker /sbin/init
sudo docker attach osmaker1


sudo docker run --name fedora0 fedora:37

sudo docker exec -it osmaker2 bash

sudo docker run --name fedora -d -ti fedora /usr/bin/bash

export DOCKER_BUILDKIT=1

docker run -d --tmpfs /tmp --tmpfs /run -v /sys/fs/cgroup:/sys/fs/cgroup:ro httpd

curl -o miniserve -L https://github.com/svenstaro/miniserve/releases/download/v0.22.0/miniserve-0.22.0-x86_64-unknown-linux-musl


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
https://github.com/plougher/squashfs-tools/blob/master/USAGE

-->
