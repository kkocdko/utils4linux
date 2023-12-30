cd ~/misc/apps
rm -rf nodejs ~/.npm
mkdir nodejs
curl -o node.tar.xz -L https://unofficial-builds.nodejs.org/download/release/v19.8.1/node-v19.8.1-linux-x64-pointer-compression.tar.xz 
tar -xf node.tar.xz --strip-component 1 -C nodejs
rm -rf node.tar.xz nodejs/include nodejs/share
cat << \EOT > nodejs/env
append_path(){
  case ":${PATH}:" in
    *:"$1":*)
      ;;
    *)
      export PATH="$1:$PATH"
      ;;
  esac
}
append_path $HOME/misc/apps/nodejs/bin
EOT
chmod +x nodejs/env
source nodejs/env
npm config set -g registry=https://registry.npmmirror.com/
