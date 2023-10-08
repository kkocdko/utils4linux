# mkfedora - utils4linux

Build your custom Fedora 39 Workstation ISO.

## FAQ

- Q: What's the goal? A:

- Q: Is this safe? A:

- Q: Why not remove SELinux? A:

<details>
<summary>Note</summary>

- https://old.reddit.com/r/Fedora/comments/6gnwr5/reducing_idle_bandwidth_consumption_in_fedora/
- https://utcc.utoronto.ca/~cks/space/blog/linux/FedoraDnfMakecacheOff
- https://bugzilla.redhat.com/show_bug.cgi?id=1187111
- https://github.com/Ultramarine-Linux
- https://www.gnu.org/software/xorriso/
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

```json
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"],
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
```

</details>
