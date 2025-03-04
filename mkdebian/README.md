# mkdebian

Custom debian livecd.

## Goals

- debian 13
- xanmod kernel
- x86_64 uefi-only uki
- ext4 only
- fast install by simple cp
- todo: optional gnome in livecd

<details>
<summary>Notes</summary>

- https://www.ventoy.net/en/doc_grub2boot.html
- https://www.ventoy.net/en/plugin_grubmenu.html
- https://packages.debian.org/bookworm/cloud-init
- https://wiki.debian.org/Cloud/SystemsComparison
- https://salsa.debian.org/cloud-team/debian-cloud-images
- https://github.com/docker-library/docs/blob/master/debian/README.md
- https://github.com/debuerreotype/docker-debian-artifacts/raw/e3f216064528d0ad005524fbafbddfd3115be946/bookworm/slim/oci/blobs/rootfs.tar.gz
- https://salsa.debian.org/cloud-team/debian-cloud-images/-/raw/master/src/debian_cloud_images/resources/image.yaml
- https://salsa.debian.org/cloud-team/debian-cloud-images/-/raw/master/config_space/sid/package_config/SYSTEM_BOOT # see also /CLOUD /GENERIC /EXTRAS
- https://salsa.debian.org/images-team/debian-cd/-/blob/master/tasks/bookworm/exclude-firmware
- https://salsa.debian.org/live-team/live-build/-/tree/master?ref_type=heads
- http://mirrors.ustc.edu.cn/debian-cdimage/weekly-live-builds/amd64/iso-hybrid/debian-live-testing-amd64-standard.iso
- https://github.com/microsoft/vscode/blob/1.94.0/src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts#L102
- https://utcc.utoronto.ca/~cks/space/blog/linux/FedoraDnfMakecacheOff
- https://bugzilla.redhat.com/show_bug.cgi?id=1187111
- https://wiki.debian.org/RepackBootableISO
- https://unix.stackexchange.com/questions/503211/how-can-an-image-file-be-created-for-a-directory
- https://unix.stackexchange.com/questions/599536/how-to-generate-small-image-of-big-ext4-partition
- https://fedoraproject.org/wiki/Changes/OptimizeSquashFS
- https://fedoraproject.org/wiki/Changes/OptimizeSquashFSOnDVDByRemovingEXT4FilesystemImageLayer
- https://unix.stackexchange.com/a/687852
- https://www.server-world.info/en/note?os=Fedora_31&p=kvm&f=7
- https://www.kraxel.org/blog/2019/09/display-devices-in-qemu/
- https://wiki.qemu.org/Documentation/Networking

<!--

# 提供一个 efi，可以从 uki 中获得 cmdline 然后编辑
# 作为主系统，用 efibootmgr；作为 iso，用 systemd-boot 或者 grub

# ibus-libpinyin

dhcpcd
# qemu{-nographic},kernel{console=ttyS0}
dbus-send --system --print-reply --dest=org.freedesktop.UDisks2 /org/freedesktop/UDisks2/Manager org.freedesktop.UDisks2.Manager.GetBlockDevices
--method org.freedesktop.UDisks2.Filesystem.Mount

apt install -y gnome-core
apt remove -y --purge firefox-esr

blockdev --rereadpt /dev/sdX # instead of partprobe
efibootmgr --create --disk /dev/sda --part 1 --label kk --loader /linux.efi --unicode 'root=UUID=xxx amd_pstate=passive mitigations=off selinux=0'

# todo: 如何在 systemd 之后自启动
ssh-keygen -A
printf "Port 4422\nPermitRootLogin yes\nPasswordAuthentication yes\n" > /etc/ssh/sshd_config.d/44easy.conf
systemctl restart ssh
ip a

curl -L http://mirrors.ustc.edu.cn/debian-cdimage/weekly-live-builds/amd64/iso-hybrid/debian-live-testing-amd64-standard.iso.packages | grep firmware


## Links

```
https://github.com/minimization/content-resolver-input
https://koji.fedoraproject.org/koji/tasks?start=100&state=all&view=flat&method=createImage&order=-id
https://blog.sigma-star.at/post/2022/07/squashfs-erofs/
https://weldr.io/lorax/image-minimizer.html
https://fedoraproject.org/wiki/Changes/OptimizeSquashFS
https://pykickstart.readthedocs.io/en/latest/kickstart-docs.html#url
https://unix.stackexchange.com/questions/103926/kickstart-copy-file-to-new-system
https://access.redhat.com/discussions/6978850
```

/etc/apt/mirrors
# https://wiki.debian.org/Gnome#Options
efibootmgr --create --disk /dev/sda --part 1 --label kk --loader /linux.efi --unicode 'root=UUID=657491eb-ced0-4f03-8e0f-04a0997d4781 ro rootflags=subvol=root initrd=\initramfs.img amd_pstate=passive mitigations=off selinux=0'

#!/bin/sh

mkdir -p /tmp/mkfedora
cd /tmp/mkfedora

printf "import sqlite3\nf=lambda p:sqlite3.connect(p).execute('vacuum;')\nf('/usr/lib/sysimage/rpm/rpmdb.sqlite')\nf('/var/lib/dnf/history.sqlite')" | python3 # tidy database
rm -rf /usr/share/locale/* # remove useless locale files
rm -rf /var/lib/selinux/targeted/active/modules/* /var/cache/swcatalog/cache/* # temp files
rm -rf /usr/share/ibus/dicts/emoji-* /usr/lib64/libpinyin/data/bigram.db # emoji and bigram in ibus
sed -i /etc/selinux/config -e 's|SELINUX=enforcing|SELINUX=disabled|' # it sucks, cause systemd-xxx failed even after removing a normal package like qemu
mkdir -p /etc/systemd/logind.conf.d
printf "[Login]\nHandleLidSwitch=ignore\nHandleLidSwitchExternalPower=ignore\nHandleLidSwitchDocked=ignore\n" >/etc/systemd/logind.conf.d/90-ignore-lid.conf
mkdir -p /etc/systemd/journald.conf.d
printf "[Journal]\nSystemMaxUse=128M\nCompress=1M\n" >/etc/systemd/journald.conf.d/90-less-log.conf
# grub2-mkconfig -o /boot/grub2/grub.cfg # apply "/etc/default/grub", GRUB_CMDLINE_LINUX="amd_pstate=passive mitigations=off selinux=0"
EOF
# https://extensions.gnome.org/extension/3843/just-perfection/ | https://extensions.gnome.org/extension-data/just-perfection-desktopjust-perfection.v27.shell-extension.zip
# run as non-root user please
# gnome-extensions install ./just-[TAB]
# gnome-extensions prefs just-[TAB]


-->

```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://docker.nju.edu.cn",
    "https://docker.mirrors.sjtug.sjtu.edu.cn"
  ],
  "max-concurrent-downloads": 8,
  "data-root": "/tmp/docker"
}
```

```sh
rm -rf /etc/docker/daemon.json ; vi /etc/docker/daemon.json

# -processors 1 -no-recovery -b 1M -Xdict-size 1M -Xbcj x86
/usr/bin/qemu-system-x86_64 -name guest=fedora,debug-threads=on -S -object {"qom-type":"secret","id":"masterKey0","format":"raw","file":"/var/lib/libvirt/qemu/domain-4-fedora/master-key.aes"} -machine pc-q35-7.2,usb=off,vmport=off,dump-guest-core=off,memory-backend=pc.ram -accel kvm -cpu host,migratable=on -m 3048 -object {"qom-type":"memory-backend-ram","id":"pc.ram","size":3196059648} -overcommit mem-lock=off -smp 4,sockets=4,cores=1,threads=1 -uuid c03f3be3-afbc-4431-a7b1-007ba2df8f9f -no-user-config -nodefaults -chardev socket,id=charmonitor,fd=30,server=on,wait=off -mon chardev=charmonitor,id=monitor,mode=control -rtc base=utc,driftfix=slew -global kvm-pit.lost_tick_policy=delay -no-hpet -no-shutdown -global ICH9-LPC.disable_s3=1 -global ICH9-LPC.disable_s4=1 -boot strict=on -device {"driver":"pcie-root-port","port":16,"chassis":1,"id":"pci.1","bus":"pcie.0","multifunction":true,"addr":"0x2"} -device {"driver":"pcie-root-port","port":17,"chassis":2,"id":"pci.2","bus":"pcie.0","addr":"0x2.0x1"} -device {"driver":"pcie-root-port","port":18,"chassis":3,"id":"pci.3","bus":"pcie.0","addr":"0x2.0x2"} -device {"driver":"pcie-root-port","port":19,"chassis":4,"id":"pci.4","bus":"pcie.0","addr":"0x2.0x3"} -device {"driver":"pcie-root-port","port":20,"chassis":5,"id":"pci.5","bus":"pcie.0","addr":"0x2.0x4"} -device {"driver":"pcie-root-port","port":21,"chassis":6,"id":"pci.6","bus":"pcie.0","addr":"0x2.0x5"} -device {"driver":"pcie-root-port","port":22,"chassis":7,"id":"pci.7","bus":"pcie.0","addr":"0x2.0x6"} -device {"driver":"pcie-root-port","port":23,"chassis":8,"id":"pci.8","bus":"pcie.0","addr":"0x2.0x7"} -device {"driver":"pcie-root-port","port":24,"chassis":9,"id":"pci.9","bus":"pcie.0","multifunction":true,"addr":"0x3"} -device {"driver":"pcie-root-port","port":25,"chassis":10,"id":"pci.10","bus":"pcie.0","addr":"0x3.0x1"} -device {"driver":"pcie-root-port","port":26,"chassis":11,"id":"pci.11","bus":"pcie.0","addr":"0x3.0x2"} -device {"driver":"pcie-root-port","port":27,"chassis":12,"id":"pci.12","bus":"pcie.0","addr":"0x3.0x3"} -device {"driver":"pcie-root-port","port":28,"chassis":13,"id":"pci.13","bus":"pcie.0","addr":"0x3.0x4"} -device {"driver":"pcie-root-port","port":29,"chassis":14,"id":"pci.14","bus":"pcie.0","addr":"0x3.0x5"} -device {"driver":"qemu-xhci","p2":15,"p3":15,"id":"usb","bus":"pci.2","addr":"0x0"} -device {"driver":"virtio-serial-pci","id":"virtio-serial0","bus":"pci.3","addr":"0x0"} -blockdev {"driver":"file","filename":"/tmp/mkfedora/fedora.qcow2","node-name":"libvirt-2-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-2-format","read-only":false,"driver":"qcow2","file":"libvirt-2-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.4","addr":"0x0","drive":"libvirt-2-format","id":"virtio-disk0","bootindex":2} -blockdev {"driver":"file","filename":"/tmp/mkfedora/out.iso","node-name":"libvirt-1-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-1-format","read-only":true,"driver":"raw","file":"libvirt-1-storage"} -device {"driver":"ide-cd","bus":"ide.0","drive":"libvirt-1-format","id":"sata0-0-0","bootindex":1} -netdev {"type":"tap","fd":"31","vhost":true,"vhostfd":"33","id":"hostnet0"} -device {"driver":"virtio-net-pci","netdev":"hostnet0","id":"net0","mac":"52:54:00:8b:ae:85","bus":"pci.1","addr":"0x0"} -chardev pty,id=charserial0 -device {"driver":"isa-serial","chardev":"charserial0","id":"serial0","index":0} -chardev socket,id=charchannel0,fd=29,server=on,wait=off -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":1,"chardev":"charchannel0","id":"channel0","name":"org.qemu.guest_agent.0"} -chardev spicevmc,id=charchannel1,name=vdagent -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":2,"chardev":"charchannel1","id":"channel1","name":"com.redhat.spice.0"} -device {"driver":"usb-tablet","id":"input0","bus":"usb.0","port":"1"} -audiodev {"id":"audio1","driver":"spice"} -spice port=5900,addr=127.0.0.1,disable-ticketing=on,image-compression=off,seamless-migration=on -device {"driver":"virtio-vga","id":"video0","max_outputs":1,"bus":"pcie.0","addr":"0x1"} -device {"driver":"ich9-intel-hda","id":"sound0","bus":"pcie.0","addr":"0x1b"} -device {"driver":"hda-duplex","id":"sound0-codec0","bus":"sound0.0","cad":0,"audiodev":"audio1"} -chardev spicevmc,id=charredir0,name=usbredir -device {"driver":"usb-redir","chardev":"charredir0","id":"redir0","bus":"usb.0","port":"2"} -chardev spicevmc,id=charredir1,name=usbredir -device {"driver":"usb-redir","chardev":"charredir1","id":"redir1","bus":"usb.0","port":"3"} -device {"driver":"virtio-balloon-pci","id":"balloon0","bus":"pci.5","addr":"0x0"} -object {"qom-type":"rng-random","id":"objrng0","filename":"/dev/urandom"} -device {"driver":"virtio-rng-pci","rng":"objrng0","id":"rng0","bus":"pci.6","addr":"0x0"} -sandbox on,obsolete=deny,elevateprivileges=deny,spawn=deny,resourcecontrol=deny -msg timestamp=on
qemu-system-x86_64 -no-user-config -nodefaults -machine q35,accel=kvm,vmport=off -cpu host -smp 4 -m 3G -display gtk,gl=on -device virtio-vga-gl -device qemu-xhci -device usb-tablet -cdrom /tmp/mkfedora/out.iso
# -drive if=pflash,format=raw,readonly=on,file=/usr/share/edk2/ovmf/OVMF_CODE.fd

sudo qemu-system-x86_64 -no-user-config -nodefaults -machine q35,accel=kvm,vmport=off -cpu host \
  -smp 4 -m 3G \
  -drive file=$winpe_iso,media=cdrom -drive file=$install_iso,media=cdrom -drive file=a.qcow2,media=disk \
  -display gtk,gl=on -device virtio-vga-gl -device qemu-xhci -device usb-tablet
sudo systemctl list-unit-files
```

</details>
