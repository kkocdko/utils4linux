# rade

A radical Node.js distro with smaller binary, pointer compression, and more optimization.

- small-icu

- pointer-compression

- snapshot-compression

- x86_64 avx2

- fully-static

- mimalloc

```sh
# pgo?
sudo docker run --name rade0 -it fedora:37
sed -e 's|^metalink=|#metalink=|g' -e 's|^#baseurl=http://download.example/pub/fedora/linux|baseurl=https://repo.huaweicloud.com/fedora|g' -i.bak /etc/yum.repos.d/fedora.repo /etc/yum.repos.d/fedora-updates.repo
find /etc/yum.repos.d -not -name 'fedora.repo' -not -name 'fedora-updates.repo' -not -name 'yum.repos.d' -delete
dnf install mold ninja-build gcc-c++ glibc-static libstdc++-static make python3-pip xz -y --setopt=install_weak_deps=False --setopt=max_parallel_downloads=6
curl -o node.tar.xz -L https://nodejs.org/download/release/v19.8.1/node-v19.8.1.tar.xz
curl -o node.tar.xz -L https://registry.npmmirror.com/-/binary/node/v19.8.1/node-v19.8.1.tar.xz
mkdir node
tar -xf node.tar.xz -C node --strip-components 1
cd node
mold -run ./configure --ninja --with-intl=small-icu --partly-static --enable-lto --experimental-enable-pointer-compression --without-npm --without-corepack
mold -run make
# -mavx2
# --v8-enable-snapshot-compression
# --with-intl=none # will break vscode
# --fully-static # will break napi
# --enable-lto
sudo docker cp rade0:/node/out/Release/node node
sudo chmod 777 node
sudo docker start -i rade0
```

https://github.com/nodejs/node/blob/HEAD/doc/api/intl.md
https://github.com/nodejs/node/blob/main/BUILDING.md#note-about-python
https://github.com/nodejs/node/issues/2948
https://unix.stackexchange.com/questions/416875/fedora-27-usr-bin-ld-cannot-find-lstdc
