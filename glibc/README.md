# glibc

## Use new glibc on old distros

```sh
mkdir -p dist
cd dist
curl -o glibc.deb -L https://mirrors.ustc.edu.cn/ubuntu/pool/main/g/glibc/libc-bin_2.38-3ubuntu1_amd64.deb
ar t glibc.deb
ar p glibc.deb data.tar.zst | tar -x --zstd
```

## Force remove version limit (DANGEROUS)

```sh
alias patchelf="/home/kkocdko/misc/apps/patchelf"
elf="/home/kkocdko/misc/apps/qemu-img-zstd-extreme"
patchelf $elf --output $elf.out $(nm --dynamic --undefined-only --with-symbol-versions $elf | grep '@GLIBC_' | sed -E 's/\s+\w\s|@GLIBC_.+//g' | sed -E 's/.+/--clear-symbol-version &/g')
```

For example, according to [the manual](https://linux.die.net/man/2/fstat64) the `fstat64` is _Since glibc 2.10_ but marked as `fstat64@GLIBC_2.33`. Just clearing the version in symbol sometimes causes segfault because of the ABI changes, but in most of the time it runs well.

## Notes

```sh
curl -o linux.tar.xz -L https://mirrors.edge.kernel.org/pub/linux/kernel/v6.x/linux-6.6.2.tar.xz
tar -xf linux.tar.xz -C linux --strip-components 1
```

- https://unix.stackexchange.com/q/138188/

- https://stackoverflow.com/q/2856438/
