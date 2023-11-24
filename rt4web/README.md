# rt4web - utils4linux

An idea about using Electron to replace Chrome and NodeJS.

## Pros

We can use `export ELECTRON_RUN_AS_NODE=1` to run `electron` executable as normal NodeJS, even with latest version of V8 (the LTS NodeJS library + latest V8, pointer compression enabled) shared with Chromium.

The Chromium in Electron is latest, stable and stripped, get out of annoy Google special services like many useless AI features. Sounds like ungoogled-chromium, but Electron is even more lightweight.

## Issues

- Security? Is the page in webview gaining privileges to call NodeJS APIs?

- Reliability? The Electron has a reputation for breaking changes, and it's more magical than ungoogled-chromium which just adds a few patches.

- Extension? In the docs of Electron, it says the extension APIs are only partially supported.
