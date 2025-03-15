# mkkernel

Exploring the kernel.

## Goals

Build a image, run in QEMU, tiny size of project.

## Notes

https://www.kernel.org/doc/html/next/process/changes.html

https://github.com/0voice/linux_kernel_wiki/blob/main/文章/QEMU调试Linux内核环境搭建.md

https://github.com/mozilla/sccache/releases/download/v0.7.6/sccache-v0.7.6-x86_64-unknown-linux-musl.tar.gz

https://www.vinnie.work/blog/2020-12-27-a-simple-busybox-system

https://github.com/cirosantilli/linux-kernel-module-cheat/tree/b3868a3b009f2ab44fa6d3db3d174930b3cf7b69#initrd

```sh
dnf install flex bison ncurses-devel elfutils-libelf-devel bear # perl openssl-devel
apt install -y build-essential flex bison bear bc libelf-dev libssl-dev libncurses-dev qemu-system-x86
```

```sh
mkdir -p dist
cd dist

rm -rf busybox
mkdir -p busybox
curl -o busybox.tar.bz2 -L https://mirrors.ustc.edu.cn/debian/pool/main/b/busybox/busybox_1.36.1.orig.tar.bz2 # https://www.busybox.net/downloads/busybox-1.36.1.tar.bz2
tar -xf busybox.tar.bz2 -C busybox --strip-components 1

cd busybox
echo "CONFIG_STATIC=y" >> .config
make defconfig
dd if=/dev/zero of=rootfs.img bs=1M count=16
mkfs.ext4 rootfs.img
mkdir rootfs
mount -t ext4 -o loop rootfs.img ./rootfs
cp -r examples/bootfloppy/etc rootfs/etc
make install CONFIG_PREFIX=./rootfs -j$(nproc)
mkdir -p rootfs/proc rootfs/dev rootfs/home rootfs/mnt
umount ./rootfs

rm -rf linux
mkdir -p linux
curl -o linux.tar.xz -L https://mirrors.ustc.edu.cn/kernel.org/linux/kernel/v6.x/linux-6.12.8.tar.xz # https://cdn.kernel.org/pub/linux/kernel/v4.x/linux-4.19.282.tar.xz
tar_prefix="$(tar -tf linux.tar.xz | head -n 1 | cut -d / -f 1)" # the head command will closes stdout, which prevents tar command from decompressing whole file
gen_exclude(){ for ext in c h dts dtsi; do echo -n " --exclude $tar_prefix/$1/*.$ext" ; done ;}
tar -xf linux.tar.xz -C linux --strip-components 1 $(gen_exclude drivers/gpu/drm) $(gen_exclude drivers/accel) $(gen_exclude sound) $(gen_exclude arch/mips) $(gen_exclude arch/powerpc)

cd linux
make clean
make x86_64_defconfig
scripts/config --disable SPECULATION_MITIGATIONS --disable VIRTUALIZATION --disable SOUND --disable DRM # make menuconfig
bear -- make -j$(nproc)

qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 1 -m 1G -nographic -kernel linux/arch/x86_64/boot/bzImage -hda busybox/rootfs.img -append "root=/dev/sda console=ttyS0"
```

```json
{
  "clangd.arguments": ["--background-index=false"]
}
```
