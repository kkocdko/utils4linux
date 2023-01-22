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

## Troubleshooting

- Throws `Command '['unshare', ...]' returned non-zero ...`:

Just restart the container.

- Throws `Command '['losetup', ...]' returned non-zero ...`:

This is because the `/dev/loop0` was taken by last anaconda process. Try to kill it (in container).

```sh
killall anaconda
rm -rf /var/run/anaconda.pid
```

<!--
https://old.reddit.com/r/Fedora/comments/6gnwr5/reducing_idle_bandwidth_consumption_in_fedora/
https://utcc.utoronto.ca/~cks/space/blog/linux/FedoraDnfMakecacheOff
https://bugzilla.redhat.com/show_bug.cgi?id=1187111

```sh
rm -rf /tmp/lmc/* ; mkdir /tmp/lmc ; cd /tmp/lmc
cp /home/kkocdko/misc/code/utils4fedora/makeimage/custom.test.ks .
docker kill mkimg0 ; docker rm mkimg0
docker run -it --network=host --privileged -v $(pwd):$(pwd) --name mkimg0 makeimage $(pwd)/custom.test.ks $(pwd)/result0 --make-iso --iso-only --compression zstd --compress-arg=-b --compress-arg=1M --compress-arg=-Xcompression-level --compress-arg=1
qemu-kvm -machine q35 -device qemu-xhci -device usb-tablet -cpu host -smp 2 -m 2G -cdrom /tmp/lmc/result0/boot.iso

docker cp mkimg0:/fedora-kickstarts/makeimage.ks ./mk.ks

LiveOS_rootfs

46.71 MB iwlax2xx-firmware
# noxattrs is not bootable
# --squashfs-only cause systemd-resolved failed
# --squashfs-only --anaconda-arg --compression lz4 --compress-arg=
# -processors 1
# -no-recovery -b 1M -Xdict-size 1M -Xbcj x86
# echo y | sudo docker container prune

sudo sh -c "systemctl kill docker && rm -rf /tmp/docker && systemctl start docker"
livemedia-creator --make-iso --no-virt --resultdir ./result --ks makeimage.ks --logfile livemedia-creator.log --fs-label ultramarine-G-x86_64 --project 'Ultramarine Linux' --releasever 37 --release 1.0 --iso-only --iso-name aa.iso
livemedia-creator --make-tar --no-virt --resultdir build/image --ks build/docker-minimal-flattened.ks --logfile build/logs/livemedia-creator.log --fs-label ultramarine-D-x86_64 --project Ultramarine Linux --releasever 37 --isfinal --release 1.0 --variant docker-minimal --image-name ultramarine-docker.tar.xz --nomacboot

curl -o miniserve -L https://github.com/svenstaro/miniserve/releases/download/v0.22.0/miniserve-0.22.0-x86_64-unknown-linux-musl

```
vi /etc/docker/daemon.json

```json
{
  "data-root": "/tmp/docker",
  "registry-mirrors": ["http://hub-mirror.c.163.com"],
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn/"]
}
```

https://mirrors.fedoraproject.org/mirrorlist?repo=fedora-37&arch=x86_64

-->
