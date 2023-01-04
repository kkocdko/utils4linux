#!/bin/sh

exit
# 1244

#/bin/sh

setenforce 0
docker build -t makeimage .

docker run --network=host --name makeimage-0 --privileged -it fedora:37 bash
# in-docker: exit
docker commit makeimage-0 makeimage
docker rm makeimage-0
docker run --network=host --name makeimage-0 --privileged -it makeimage bash

# in-docker-begin
cd fedora-kickstarts
ksflatten -c fedora-live-workstation.ks -o makeimage.ks
killall anaconda
rm -rf /var/run/anaconda.pid
rm -rf lmc-result
livemedia-creator --no-virt --releasever 37 --ks makeimage.ks --resultdir ./lmc-result --make-iso --iso-only --iso-name makeimage.iso
# in-docker-end


# 1244



exit

# ==============================

sudo docker kill makeimage
sudo docker start makeimage
sudo docker exec -it makeimage bash




sudo setenforce 0
sudo sh -c "systemctl kill docker && rm -rf /tmp/docker && systemctl start docker"
sudo docker run --network=host --hostname docker --name makeimage --privileged=true --cap-add=SYS_ADMIN -d fedora:37 tail -f /dev/null
sudo docker exec -it makeimage bash

echo >> /etc/dnf/dnf.conf
echo max_parellel_downloads=8 >> /etc/dnf/dnf.conf
dnf install -y dnf-plugins-core
dnf config-manager --add-repo https://github.com/andaman-common-pkgs/subatomic-repos/raw/main/terra37.repo
dnf install -y lorax-lmc-novirt pykickstart anaconda make spin-kickstarts busybox git-core
git clone --depth=1 https://ghproxy.com/https://github.com/Ultramarine-Linux/build-scripts.git
# git clone --depth=1 https://github.com/Ultramarine-Linux/build-scripts
cd build-scripts
./build.sh gnome

cd /usr/share/spin-kickstarts/
ksflatten -c fedora-live-workstation.ks -o makeimage.ks


dnf install -y pykickstart anaconda lorax-lmc-novirt spin-kickstarts busybox
cd /usr/share/spin-kickstarts/
ksflatten -c fedora-live-workstation.ks -o makeimage.ks
livemedia-creator \
    --make-iso \
    --no-virt \
    --resultdir ./result \
    --ks makeimage.ks \
    --releasever 37 \
    --iso-only \
    --iso-name \
    makeimage.iso


2023-01-02 03:26:19,613: livemedia-creator v38.4-1

rm -rf result

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

sudo setenforce 0
cd
dnf install -y mock spin-kickstarts pungi lorax livemedia-creator -y
livemedia-creator --ks /usr/share/spin-kickstarts/fedora-live-workstation.ks --no-virt --resultdir /var/lmc --project fedora-kk --make-iso --volid fedora-kk --iso-only --iso-name fedora-kk-x64.iso --releasever 37 --macboot
dnf install anaconda -y --setopt=install_weak_deps=False
cd /usr/share/spin-kickstarts/

livecd-creator --verbose --config /usr/share/spin-kickstarts/fedora-live-base.ks --cache=/var/cache/live

# https://hub.docker.com/_/fedora


sudo docker build -t osmaker .
sudo docker run \
    --name osmaker1 --tty --privileged \
    --mount type=bind,source=/sys/fs/cgroup,target=/sys/fs/cgroup \
    --mount type=bind,source=/sys/fs/fuse,target=/sys/fs/fuse \
    --mount type=tmpfs,destination=/tmp \
    --mount type=tmpfs,destination=/run \
    --mount type=tmpfs,destination=/run/lock \
    osmaker

docker run -tid -p 1222:22 --hostname fedora34 --name osmaker1 \
     --entrypoint=/usr/lib/systemd/systemd \
     --env container=docker \
     --mount type=bind,source=/sys/fs/cgroup,target=/sys/fs/cgroup \
     --mount type=bind,source=/sys/fs/fuse,target=/sys/fs/fuse \
     --mount type=tmpfs,destination=/tmp \
     --mount type=tmpfs,destination=/run \
     --mount type=tmpfs,destination=/run/lock \
     local:fedora34-systemd --log-level=info --unit=sysinit.target

sudo docker run -d --tmpfs /tmp --tmpfs /run -v /sys/fs/cgroup:/sys/fs/cgroup:ro osmaker

sudo docker run -it --name u0 ubuntu bash
sudo docker exec -it xxxx bash


sudo docker run --name osmaker1 -d --tmpfs /tmp --tmpfs /run -v /sys/fs/cgroup:/sys/fs/cgroup:ro osmaker /sbin/init
sudo docker attach osmaker1


sudo docker run --name fedora0 fedora:37

sudo docker exec -it osmaker2 bash

sudo docker run --name fedora -d -ti fedora /usr/bin/bash

"http://hub-mirror.c.163.com"

sudo sh -c "systemctl kill docker && rm -rf /tmp/docker && systemctl start docker"

sudo sh -c "docker rm osmaker1 && docker rmi osmaker"

export DOCKER_BUILDKIT=1

docker run -d --tmpfs /tmp --tmpfs /run -v /sys/fs/cgroup:/sys/fs/cgroup:ro httpd

vi /etc/docker/daemon.json 

curl -o miniserve -L https://github.com/svenstaro/miniserve/releases/download/v0.22.0/miniserve-0.22.0-x86_64-unknown-linux-musl

sudo qemu-kvm -machine q35 -device qemu-xhci -device usb-tablet -cpu host -smp 4 -m 2G -cdrom /tmp/boot.iso
