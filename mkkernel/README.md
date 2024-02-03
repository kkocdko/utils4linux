# mkkernel

Exploring the kernel.

## Notes

https://github.com/0voice/linux_kernel_wiki

https://github.com/0voice/linux_kernel_wiki/blob/main/文章/QEMU调试Linux内核环境搭建.md

https://github.com/mozilla/sccache/releases/download/v0.7.6/sccache-v0.7.6-x86_64-unknown-linux-musl.tar.gz

```sh
dnf install flex bison ncurses-devel elfutils-libelf-devel perl bear openssl-devel
```

```sh
mkdir -p dist
cd dist

curl -o linux.tar.xz -L https://mirrors.ustc.edu.cn/kernel.org/linux/kernel/v6.x/linux-6.7.tar.xz # https://cdn.kernel.org/pub/linux/kernel/v4.x/linux-4.19.282.tar.xz
rm -rf linux
mkdir -p linux
tar_prefix="$(tar "--exclude=*/*/*" -tf linux.tar.xz | head -n1 | cut -d "/" -f 1)"
tar -xf linux.tar.xz -C linux --strip-components 1 --exclude $tar_prefix/drivers/gpu/drm/amd/include
cd linux
find drivers/gpu/drm -name "*.c" -or -name "*.h" -delete

# https://www.kernel.org/doc/html/next/process/changes.html

make clean
make x86_64_defconfig
# make menuconfig
scripts/config --disable SPECULATION_MITIGATIONS
scripts/config --disable VIRTUALIZATION
scripts/config --disable DRM
bear -- make -j$(nproc)
find -name bzImage
qemu-kvm -kernel ./arch/x86_64/boot/bzImage
```

```json
{
  "clangd.arguments": ["--background-index=false"]
}
```

```sh
# mkdir busybox
# curl -L https://busybox.net/downloads/busybox-1.36.0.tar.bz2
# tar -xf busybox-1.36.0.tar.bz2 -C busybox --strip-components 1
```
