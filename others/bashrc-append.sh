#!/bin/bash
exit

# Below should be appended into ~/.bashrc | 20250114
# export GOROOT=$HOME/misc/apps/go # no, just keep default, the tips in https://go.dev/doc/install
# export GOPATH=$HOME/misc/apps/go/gopath
# add_path $HOME/misc/apps/go/gopath/bin
export GOPROXY=https://goproxy.cn,direct
export RUSTUP_DIST_SERVER="https://rsproxy.cn" # and follow rsproxy's cargo config.toml
export RUSTUP_UPDATE_ROOT="https://rsproxy.cn/rustup"
for entry in "$HOME/.cargo/bin" "$HOME/misc/apps/nodejs/bin" "/usr/local/go/bin"; do
  case ":${PATH}:" in
    *:"$entry":*)
      ;;
    *)
      export PATH="$entry:$PATH" # prepending to overridde origin
      ;;
  esac
done
