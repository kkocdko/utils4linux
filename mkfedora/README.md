# mkfedora - utils4linux

Build your custom Fedora 39 Workstation ISO.

<!--
-gnome-browser-connector
-fedora-chromium-config
-fedora-chromium-config-gnome
-fedora-repos-modular
-mozjs78

https://old.reddit.com/r/Fedora/comments/6gnwr5/reducing_idle_bandwidth_consumption_in_fedora/
https://utcc.utoronto.ca/~cks/space/blog/linux/FedoraDnfMakecacheOff
https://bugzilla.redhat.com/show_bug.cgi?id=1187111

```sh
rm -rf /tmp/lmc/* ; mkdir /tmp/lmc ; cd /tmp/lmc
cp /home/kkocdko/misc/code/utils4linux/mkfedora/custom.test.ks .
docker kill mkfedora0 ; docker rm mkfedora0
docker run -it --network=host --privileged -v $(pwd):$(pwd) --name mkfedora0 mkfedora $(pwd)/custom.test.ks $(pwd)/result0 --make-iso --iso-only --compression zstd --compress-arg=-b --compress-arg=1M --compress-arg=-Xcompression-level --compress-arg=1
qemu-kvm -machine q35 -device qemu-xhci -device usb-tablet -cpu host -smp 2 -m 2G -cdrom /tmp/lmc/result0/boot.iso

docker cp mkfedora0:/fedora-kickstarts/mkfedora.ks ./mk.ks

LiveOS_rootfs

46.71 MB iwlax2xx-firmware
# noxattrs is not bootable
# --squashfs-only cause systemd-resolved failed
# --squashfs-only --anaconda-arg --compression lz4 --compress-arg=
# -processors 1
# -no-recovery -b 1M -Xdict-size 1M -Xbcj x86
# echo y | sudo docker container prune

sudo sh -c "systemctl kill docker && rm -rf /tmp/docker && systemctl start docker"
livemedia-creator --make-iso --no-virt --resultdir ./result --ks mkfedora.ks --logfile livemedia-creator.log --fs-label ultramarine-G-x86_64 --project 'Ultramarine Linux' --releasever 37 --release 1.0 --iso-only --iso-name aa.iso
livemedia-creator --make-tar --no-virt --resultdir build/image --ks build/docker-minimal-flattened.ks --logfile build/logs/livemedia-creator.log --fs-label ultramarine-D-x86_64 --project Ultramarine Linux --releasever 37 --isfinal --release 1.0 --variant docker-minimal --image-name ultramarine-docker.tar.xz --nomacboot

curl -o miniserve -L https://github.com/svenstaro/miniserve/releases/download/v0.22.0/miniserve-0.22.0-x86_64-unknown-linux-musl

```

rm -rf /etc/docker/daemon.json ; vi /etc/docker/daemon.json

```json
{
  "max-concurrent-downloads": 8,
  "data-root": "/tmp/docker"
}
  "registry-mirrors": [
    "http://hub-mirror.c.163.com"
  ],
```

https://mirrors.fedoraproject.org/mirrorlist?repo=fedora-37&arch=x86_64

-->
<!--

exit

for entry in $(echo "firefox libreoffice-* ..."); do
  echo $entry
  sudo dnf remove $entry
done
# qemu-device-display-virtio-gpu-gl

~/misc/apps/dua

mount -o remount,size=80%,noatime /run

curl -o root.tar.xz -L https://mirror.23m.com/fedora/linux/development/39/Container/x86_64/images/Fedora-Container-Base-39-20230920.n.0.x86_64.tar.xz
mkdir root
tar -Oxf root.tar.xz '*/layer.tar' | tar -xC root
chroot root /bin/bash

sudo -D `pwd` bash

# https://www.gnu.org/software/xorriso/
# https://stackoverflow.com/questions/31831268/genisoimage-and-uefi/75688552#75688552
# https://wiki.debian.org/RepackBootableISO
# https://unix.stackexchange.com/questions/503211/how-can-an-image-file-be-created-for-a-directory
# https://unix.stackexchange.com/questions/599536/how-to-generate-small-image-of-big-ext4-partition
# https://fedoraproject.org/wiki/Changes/OptimizeSquashFS
# https://fedoraproject.org/wiki/Changes/OptimizeSquashFSOnDVDByRemovingEXT4FilesystemImageLayer

-->