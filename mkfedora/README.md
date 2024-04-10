# mkfedora - utils4linux

Build your custom Fedora 39 Workstation ISO.

## FAQ

- Q: What's the goal? A:

- Q: Is this safe? A:

- Q: Why not prune SELinux? A:

<details>
<summary>Notes</summary>

- https://old.reddit.com/r/Fedora/comments/6gnwr5/reducing_idle_bandwidth_consumption_in_fedora/
- https://utcc.utoronto.ca/~cks/space/blog/linux/FedoraDnfMakecacheOff
- https://bugzilla.redhat.com/show_bug.cgi?id=1187111
- https://github.com/Ultramarine-Linux
- https://stackoverflow.com/questions/31831268/genisoimage-and-uefi/75688552#75688552
- https://wiki.debian.org/RepackBootableISO
- https://unix.stackexchange.com/questions/503211/how-can-an-image-file-be-created-for-a-directory
- https://unix.stackexchange.com/questions/599536/how-to-generate-small-image-of-big-ext4-partition
- https://fedoraproject.org/wiki/Changes/OptimizeSquashFS
- https://fedoraproject.org/wiki/Changes/OptimizeSquashFSOnDVDByRemovingEXT4FilesystemImageLayer
- https://mirrors.fedoraproject.org/mirrorlist?repo=fedora-37&arch=x86_64
- https://unix.stackexchange.com/a/687852
- https://www.gnu.org/software/xorriso/man_1_xorriso.html
- https://www.server-world.info/en/note?os=Fedora_31&p=kvm&f=7
- https://www.kraxel.org/blog/2019/09/display-devices-in-qemu/
- https://wiki.qemu.org/Documentation/Networking
- https://github.com/rpm-software-management/dnf5/pull/630
- https://fedoraproject.org/wiki/Changes/ReplaceDnfWithDnf5
- https://bugzilla.redhat.com/show_bug.cgi?id=2214520
- https://yeasy.gitbook.io/docker_practice/install/mirror

<!--

```sh
ln -s `realpath ./powerctl` ~/misc/apps/powerctl
```


## Links

```
https://fedoraproject.org/wiki/How_to_create_a_Fedora_install_ISO_for_testing
https://koji.fedoraproject.org/koji/
https://docs.fedoraproject.org/en-US/quick-docs/creating-and-using-a-live-installation-image/#proc_creating-and-using-live-cd
https://cloud-atlas.readthedocs.io/zh_CN/latest/docker/init/docker_systemd.html#id2
https://github.com/robertdebock/docker-fedora-systemd
https://serverfault.com/questions/607769/running-systemd-inside-a-docker-container-arch-linux
https://medium.com/swlh/docker-and-systemd-381dfd7e4628
https://github.com/kheshav/dockerSystemctl/blob/master/runDocker.sh
https://hub.docker.com/r/jrei/systemd-ubuntu
https://fedoraproject.org/wiki/Livemedia-creator-_How_to_create_and_use_a_Live_CD
https://weldr.io/lorax/livemedia-creator.html
https://ask.fedoraproject.org/t/help-creating-fedora-live-cd-with-a-standard-kickstart-file/11258/13
https://fedoraproject.org/wiki/Remix
https://pykickstart.readthedocs.io/en/latest/kickstart-docs.html
https://pagure.io/fedora-kickstarts/c/879a7d74092f9d324d9488f981cab625f557d6b4?branch=main
https://ask.fedoraproject.org/t/difference-between-gnome-desktop-and-workstation-product-enviroment/1269
https://koji.fedoraproject.org/koji/taskinfo?taskID=61781551
https://github.com/minimization/content-resolver-input
https://mirrors.ustc.edu.cn/help/fedora.html
https://mirrors.tuna.tsinghua.edu.cn/help/fedora/
https://docs.docker.com/engine/reference/builder/
https://github.com/codespaces
https://koji.fedoraproject.org/koji/tasks?start=100&state=all&view=flat&method=createImage&order=-id
https://blog.sigma-star.at/post/2022/07/squashfs-erofs/
https://weldr.io/lorax/livemedia-creator.html#using-a-proxy-with-repos
https://weldr.io/lorax/image-minimizer.html
https://fedoraproject.org/wiki/Changes/OptimizeSquashFS
https://pykickstart.readthedocs.io/en/latest/kickstart-docs.html#url
https://unix.stackexchange.com/questions/103926/kickstart-copy-file-to-new-system
https://access.redhat.com/discussions/6978850
```
-->

```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://docker.nju.edu.cn",
    "https://docker.mirrors.sjtug.sjtu.edu.cn"
  ]
}
```

```json
{
  "registry-mirrors": [],
  "max-concurrent-downloads": 8,
  "data-root": "/tmp/docker"
}
```

```sh
rm -rf /etc/docker/daemon.json ; vi /etc/docker/daemon.json
for entry in $(echo "firefox libreoffice-* ..."); do
  echo $entry
  sudo dnf remove $entry
done
-gnome-browser-connector
-mozjs78
# -processors 1 -no-recovery -b 1M -Xdict-size 1M -Xbcj x86
# qemu-device-display-virtio-gpu-gl
mount -o remount,size=80%,noatime /run
curl -o root.tar.xz -L https://mirror.23m.com/fedora/linux/development/39/Container/x86_64/images/Fedora-Container-Base-39-20230920.n.0.x86_64.tar.xz
mkdir root
tar -Oxf root.tar.xz '*/layer.tar' | tar -xC root
chroot root /bin/bash

/usr/bin/qemu-system-x86_64 -name guest=fedora,debug-threads=on -S -object {"qom-type":"secret","id":"masterKey0","format":"raw","file":"/var/lib/libvirt/qemu/domain-4-fedora/master-key.aes"} -machine pc-q35-7.2,usb=off,vmport=off,dump-guest-core=off,memory-backend=pc.ram -accel kvm -cpu host,migratable=on -m 3048 -object {"qom-type":"memory-backend-ram","id":"pc.ram","size":3196059648} -overcommit mem-lock=off -smp 4,sockets=4,cores=1,threads=1 -uuid c03f3be3-afbc-4431-a7b1-007ba2df8f9f -no-user-config -nodefaults -chardev socket,id=charmonitor,fd=30,server=on,wait=off -mon chardev=charmonitor,id=monitor,mode=control -rtc base=utc,driftfix=slew -global kvm-pit.lost_tick_policy=delay -no-hpet -no-shutdown -global ICH9-LPC.disable_s3=1 -global ICH9-LPC.disable_s4=1 -boot strict=on -device {"driver":"pcie-root-port","port":16,"chassis":1,"id":"pci.1","bus":"pcie.0","multifunction":true,"addr":"0x2"} -device {"driver":"pcie-root-port","port":17,"chassis":2,"id":"pci.2","bus":"pcie.0","addr":"0x2.0x1"} -device {"driver":"pcie-root-port","port":18,"chassis":3,"id":"pci.3","bus":"pcie.0","addr":"0x2.0x2"} -device {"driver":"pcie-root-port","port":19,"chassis":4,"id":"pci.4","bus":"pcie.0","addr":"0x2.0x3"} -device {"driver":"pcie-root-port","port":20,"chassis":5,"id":"pci.5","bus":"pcie.0","addr":"0x2.0x4"} -device {"driver":"pcie-root-port","port":21,"chassis":6,"id":"pci.6","bus":"pcie.0","addr":"0x2.0x5"} -device {"driver":"pcie-root-port","port":22,"chassis":7,"id":"pci.7","bus":"pcie.0","addr":"0x2.0x6"} -device {"driver":"pcie-root-port","port":23,"chassis":8,"id":"pci.8","bus":"pcie.0","addr":"0x2.0x7"} -device {"driver":"pcie-root-port","port":24,"chassis":9,"id":"pci.9","bus":"pcie.0","multifunction":true,"addr":"0x3"} -device {"driver":"pcie-root-port","port":25,"chassis":10,"id":"pci.10","bus":"pcie.0","addr":"0x3.0x1"} -device {"driver":"pcie-root-port","port":26,"chassis":11,"id":"pci.11","bus":"pcie.0","addr":"0x3.0x2"} -device {"driver":"pcie-root-port","port":27,"chassis":12,"id":"pci.12","bus":"pcie.0","addr":"0x3.0x3"} -device {"driver":"pcie-root-port","port":28,"chassis":13,"id":"pci.13","bus":"pcie.0","addr":"0x3.0x4"} -device {"driver":"pcie-root-port","port":29,"chassis":14,"id":"pci.14","bus":"pcie.0","addr":"0x3.0x5"} -device {"driver":"qemu-xhci","p2":15,"p3":15,"id":"usb","bus":"pci.2","addr":"0x0"} -device {"driver":"virtio-serial-pci","id":"virtio-serial0","bus":"pci.3","addr":"0x0"} -blockdev {"driver":"file","filename":"/tmp/mkfedora/fedora.qcow2","node-name":"libvirt-2-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-2-format","read-only":false,"driver":"qcow2","file":"libvirt-2-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.4","addr":"0x0","drive":"libvirt-2-format","id":"virtio-disk0","bootindex":2} -blockdev {"driver":"file","filename":"/tmp/mkfedora/out.iso","node-name":"libvirt-1-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-1-format","read-only":true,"driver":"raw","file":"libvirt-1-storage"} -device {"driver":"ide-cd","bus":"ide.0","drive":"libvirt-1-format","id":"sata0-0-0","bootindex":1} -netdev {"type":"tap","fd":"31","vhost":true,"vhostfd":"33","id":"hostnet0"} -device {"driver":"virtio-net-pci","netdev":"hostnet0","id":"net0","mac":"52:54:00:8b:ae:85","bus":"pci.1","addr":"0x0"} -chardev pty,id=charserial0 -device {"driver":"isa-serial","chardev":"charserial0","id":"serial0","index":0} -chardev socket,id=charchannel0,fd=29,server=on,wait=off -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":1,"chardev":"charchannel0","id":"channel0","name":"org.qemu.guest_agent.0"} -chardev spicevmc,id=charchannel1,name=vdagent -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":2,"chardev":"charchannel1","id":"channel1","name":"com.redhat.spice.0"} -device {"driver":"usb-tablet","id":"input0","bus":"usb.0","port":"1"} -audiodev {"id":"audio1","driver":"spice"} -spice port=5900,addr=127.0.0.1,disable-ticketing=on,image-compression=off,seamless-migration=on -device {"driver":"virtio-vga","id":"video0","max_outputs":1,"bus":"pcie.0","addr":"0x1"} -device {"driver":"ich9-intel-hda","id":"sound0","bus":"pcie.0","addr":"0x1b"} -device {"driver":"hda-duplex","id":"sound0-codec0","bus":"sound0.0","cad":0,"audiodev":"audio1"} -chardev spicevmc,id=charredir0,name=usbredir -device {"driver":"usb-redir","chardev":"charredir0","id":"redir0","bus":"usb.0","port":"2"} -chardev spicevmc,id=charredir1,name=usbredir -device {"driver":"usb-redir","chardev":"charredir1","id":"redir1","bus":"usb.0","port":"3"} -device {"driver":"virtio-balloon-pci","id":"balloon0","bus":"pci.5","addr":"0x0"} -object {"qom-type":"rng-random","id":"objrng0","filename":"/dev/urandom"} -device {"driver":"virtio-rng-pci","rng":"objrng0","id":"rng0","bus":"pci.6","addr":"0x0"} -sandbox on,obsolete=deny,elevateprivileges=deny,spawn=deny,resourcecontrol=deny -msg timestamp=on
# dnf install xorriso squashfs-tools
# mount -o remount,size=80%,noatime /tmp
# curl 'https://mirrors.fedoraproject.org/metalink?repo=fedora-39&arch=x86_64'
# mirror_root="https://mirror.23m.com/fedora/linux"
# mirror_root="https://mirror.alwyzon.net/fedora/linux"
mirror_root="https://mirrors.ustc.edu.cn/fedora"
curl -o official.iso -L $mirror_root/development/39/Workstation/x86_64/iso/Fedora-Workstation-Live-x86_64-39-1.5.iso
curl -O -L https://dl.fedoraproject.org/pub/fedora/linux/development/40/Workstation/x86_64/iso/Fedora-Workstation-Live-x86_64-40-20240321.n.0.iso
exit

rm -rf qcow2 a.qcow2
qemu-img create -f qcow2 a.qcow2 32G
qemu-system-x86_64 -no-user-config -nodefaults -machine q35,accel=kvm,vmport=off -cpu host -smp 4 -m 3G -display gtk,gl=on -device virtio-vga-gl -device qemu-xhci -device usb-tablet -cdrom /tmp/mkfedora/out.iso
# -drive if=pflash,format=raw,readonly=on,file=/usr/share/edk2/ovmf/OVMF_CODE.fd

dnf remove -y qemu-device-display-virtio-*
dnf install -y qemu-device-display-virtio-gpu qemu-device-display-virtio-gpu-gl qemu-device-display-virtio-vga qemu-device-display-virtio-vga-gl

qemu-img create -f qcow2 a.qcow2 32G
winpe_iso="/run/media/kkocdko/data/pkgs/WinPE/WePE_2.2_10-64.iso"
install_iso="/home/kkocdko/misc/YLX_Windows_11_25967.1000_2N1_x64_2023.10.7_90A96599.iso"
sudo qemu-system-x86_64 -no-user-config -nodefaults -machine q35,accel=kvm,vmport=off -cpu host \
  -smp 4 -m 3G \
  -drive file=$winpe_iso,media=cdrom -drive file=$install_iso,media=cdrom -drive file=a.qcow2,media=disk \
  -display gtk,gl=on -device virtio-vga-gl -device qemu-xhci -device usb-tablet

mkdir -p /tmp/win11
cd /tmp/win11
# rm -rf qcow2 a.qcow2
qemu-img create -f qcow2 a.qcow2 64G
winpe_iso="/run/media/kkocdko/data/pkgs/WinPE/WePE_2.2_10-64.iso"
install_iso="/run/media/kkocdko/data/pkgs/sys-imgs/Win11_23H2_English_x64.iso"

sudo systemctl list-unit-files
```

</details>
