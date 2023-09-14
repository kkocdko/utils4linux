#!/bin/sh
rm -rf out
mkdir -p out
extra_args='--bundle --minify --target=esnext --external:vs/css*'
# esbuild src/vs/workbench/workbench.web.main.nls.js --outdir=out $extra_args
# esbuild src/vs/workbench/workbench.web.main.ts --outdir=out $extra_args
for file in `find src -name *.css`; do
    cat $file >>out/workbench.web.main.css
done
# esbuild --bundle `find src -name *.css` --outfile=out/workbench.web.main.css
# esbuild src/vs/code/browser/workbench/workbench.ts --outdir=out $extra_args
# ~/misc/apps/miniserve -p 9423 --index src/vs/code/browser/workbench/workbench.html .
# src/vs/code/browser/workbench/workbench.html
#  '' --serve=9423  # --bundle --minify --sourcemap --jsx=automatic --legal-comments=none --watch
# https://github.com/microsoft/vscode/wiki/How-to-Contribute
