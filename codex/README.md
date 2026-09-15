# codex-lean

The result:

```
$ ls -lh target/lean/codex
-rwxrwxr-x 2 kkocdko kkocdko 91M Sep 16 10:11 target/lean/codex
```

## Steps

```sh
dist_dir=/media/kkocdko/KK_TMP_1/home/.cache/codex-lean-dist
mkdir -p $dist_dir
ln -sf $dist_dir dist
# > start from here
cd dist
pwd # ~/misc/code/utils4linux/codex/dist
# < load source
# - method 1: is fresh start
git clone --branch release/0.150 --depth 15 https://github.com/openai/codex # 7a48857579dc8e4d84eba9244df1dc87c7bfc51d
git apply --reject main.patch # inside the correct dir
# - method 2: from cached tar file
tar -xf main.tar.zst
# < load source complete
cd codex/codex-rs
# > follow upstream
git pull --rebase
# > compile
cargo build --bin codex --profile lean -q # version = "0.150.1+lean.15" inside Cargo.toml
# > commit as new lean version, then export the patch
git add . ; git commit -m lean.99
# > other old notes
git diff HEAD~1 HEAD > ../main.patch
# cd /tmp/z/trim ; git clone --depth 20 file:///tmp/z/codex
# tar --zstd -cf /mnt/c/misc/code/codex-lean/main.tar.zst codex
# proxychains ssh klc2u1@klc2.lan "wsl -e xz -1c /tmp/z/codex/codex-rs/target/release/codex 2>nul" | xz -d > ~/misc/apps/codex
# > run llm agent for working on the lean project
pushd $dist_dir/codex/codex-rs
codex
```

## Intro for LLM

We are working to reduce the compiled binary size of open source `codex` cli (write with rust lang).

MUST make the minimum code changes to cleverly cut off the call paths to deps, NEVER deleting code everywhere. Warnings are hidden, NEVER rename `unused` to `_unused`.

First run `ls -lh Cargo.toml core/Cargo.toml` to ensure the correct working dir. If failed, you MUST stop and don't do anything. The git repo root is `../` but NEVER modify outside working dir.

The version number in `README.md` or `Cargo.toml` is just examples. Do not care. We may want to rebase to latest commit, or do something else depends on the current task.

Please review the latest commit (NEVER read other upsteam commits). Features like voice input and image generation are removed, the deeply coupled `network-proxy` (proxy for sandbox) and `otel` (open telemetry) are replaced with noop placeholders.

When reviewing this latest commit, should exclude the `./network-proxy/src/lib_placeholder.rs` and `./otel/src/lib_placeholder.rs` files (they are about 1k lines). Only read them when I agree.

Compilation is slow. MUST use the `cargo build/bloat --bin codex --profile lean -q` command, other profiles is prohibited (cause full recompilation). NEVER run `cargo fmt` or `just`, they will cause large code rewrite.

The cargo bloat is not good enough. Some generic may spread everywhere. Do not rely on it too heavily.

NEVER remove `starlark`.

Also, there are some other modifications, such as:

- Modified `./core/src/tools/mod.rs` to allow fallback to direct tool mode.

- Modified `./core/src/tools/code_mode/mod.rs` to avoid duplicate warning.
