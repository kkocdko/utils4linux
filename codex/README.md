# codex-lean

```sh
git pull --rebase origin release/0.150 # https://github.com/openai/codex # version = "0.150.1+lean.14" # 7a48857579dc8e4d84eba9244df1dc87c7bfc51d
cargo build --bin codex --profile release -q
git add . ; git commit -m lean.99
git diff HEAD~1 HEAD > /mnt/c/misc/code/codex-lean/main.patch
# cd /tmp/z/trim ; git clone --depth 20 file:///tmp/z/codex
tar --zstd -cf /mnt/c/misc/code/codex-lean/main.tar.zst codex
proxychains ssh klc2u1@klc2.lan "wsl -e xz -1c /tmp/z/codex/codex-rs/target/release/codex 2>nul" | xz -d > ~/misc/apps/codex
```

Make compressed temp dir:

```sh
truncate -s 16G /tmp/z.img
mkdir -p /tmp/z
/sbin/mkfs.btrfs -f /tmp/z.img
mount -o nossd,commit=5,compress=zstd /tmp/z.img /tmp/z
chmod 1777 /tmp/z
mkdir -p /mnt/z
mount --bind /tmp/z /mnt/z
mount --make-shared /mnt/z
watch "df -h | grep /tmp ; du -sh /tmp/z.img ; free -h"
```
