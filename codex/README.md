# codex-lean

## Plans

In `./codex/codex-rs/exec-server/src/server/registry.rs:79`, and `rg 'tracing\-opentelemetry'` .

## Steps

```sh
# > start from here
ls -lh main.patch
cd dist
pwd # ~/misc/code/utils4linux/codex/dist

# > load source
git clone --branch release/0.xxx --depth 15 https://github.com/openai/codex # e72da2b53805894878023d01949a25a082e0a5cb
cd codex/codex-rs
git apply ../../../main.patch

# > link target dir to use another disk
real_target_dir=/media/kkocdko/KK_TMP_1/home/.cache/rust_target_codex_lean
mkdir -p $real_target_dir
ln -sf $real_target_dir target

# > compile and verify
# MALLOC_CONF="abort_conf:true,background_thread:true,dirty_decay_ms:3000,muzzy_decay_ms:3000,percpu_arena:phycpu,metadata_thp:auto" LD_PRELOAD=$HOME/misc/apps/libjemalloc.so.2 cargo --version
cargo check --bin codex --profile lean -q # version = "0.150.1+lean.15" inside Cargo.toml, to replace 0.0.0
ls -lh target/lean/codex # 91M
target/lean/codex --version # codex-cli x.x.x

# > commit, then export to a patch
git add .
git commit -m lean.99
git diff HEAD~1 HEAD > ../../../main.patch

# > follow upstream
cd ..
git remote set-branches --add origin main
git fetch origin main --depth=15
git log -1
git switch -c lean-main origin/main
git cherry-pick commit_hash
# git pull --rebase

# cd /tmp/z/trim ; git clone --depth 20 file:///tmp/z/codex
# tar --zstd -cf main.tar.zst codex
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

Please review the latest commit (NEVER read other upsteam commits). Features like voice input and image generation are removed, the deeply coupled `network-proxy` (proxy for sandbox) and `otel` (open telemetry) are replaced with noop placeholders (like `./network-proxy/src/lib_placeholder.rs` and `./otel/src/lib_placeholder.rs`).

Compilation is slow. MUST use the `cargo build/bloat/check --bin codex --profile lean -q` command, other profiles is prohibited (cause full recompilation). NEVER run `cargo fmt` or `just`, they will cause large code rewrite.

The cargo bloat is not good enough. Some generic may spread everywhere. Do not rely on it too heavily.

NEVER remove `starlark`.

Also, there are some other modifications, such as:

- Modified `./core/src/tools/mod.rs` to allow fallback to direct tool mode.

- Modified `./core/src/tools/code_mode/mod.rs` to avoid duplicate warning.

### Follow Upstream

当我们在跟进上游时，如果遇到缺失，例如

```
$ cargo check --bin codex --profile lean -q
error[E0599]: no method named `with_product_sku` found for struct `codex_otel::SessionTelemetry` in the current scope
   --> core/src/tools/registry.rs:537:14
    |
533 |           let otel = invocation
    |  ____________________-
534 | |             .step_context
535 | |             .session_telemetry
536 | |             .clone()
537 | |             .with_product_sku(invocation.turn.config.apps_mcp_product_sku.as_deref());
    | |             -^^^^^^^^^^^^^^^^ method not found in `codex_otel::SessionTelemetry`
    | |_____________|
    |
Some errors have detailed explanations: E0277, E0422, E0432, E0433, E0599.
For more information about an error, try `rustc --explain E0277`.
error: could not compile `codex-core` (lib) due to 11 previous errors
```

那么，我们应当搜索代码，这可能是新增的一个成员函数。

```
$ rg "fn with_product_sku" # 可以使用 "fn the_name"、"struct the_name" 等方式来缩小搜索范围
otel/src/events/session_telemetry.rs
158:    pub fn with_product_sku(mut self, product_sku: Option<&str>) -> Self {
```

然后，我们就可以去 `otel/src/events/session_telemetry.rs` 里找，看它属于哪个 struct。搞清楚之后，小心地将它补充到 `otel/src/lib_placeholder.rs` 里面。
