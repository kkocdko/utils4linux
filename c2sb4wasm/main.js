import { readFileSync, writeFileSync, rmSync } from "node:fs";
global.process.versions.electron = "yes";
const wasmExec = `https://raw.githubusercontent.com/tinygo-org/tinygo/v0.30.0/targets/wasm_exec.js`;
eval(await (await fetch(wasmExec)).text());
const wasmBuf = readFileSync("clash2singbox.wasm");
const translate = async (origin) => {
  return new Promise(async (resolve) => {
    const go = new Go();
    let wasm = null;
    go.importObject.env.setOutput = (addr, length) => {
      const buf = new Uint8Array(wasm.exports.memory.buffer, addr, length);
      resolve(new TextDecoder().decode(buf));
    };
    wasm = (await WebAssembly.instantiate(wasmBuf, go.importObject)).instance;
    go.run(wasm);
    const addr = wasm.exports.getBuffer();
    const buffer = wasm.exports.memory.buffer;
    const mem = new Uint8Array(buffer);
    const encoded = new TextEncoder("utf-8").encode(origin);
    mem.set(encoded, addr);
    wasm.exports.translate(addr, encoded.length);
  });
};
const origin = readFileSync("config.yaml").toString();
console.log(await translate(origin));
// curl -o config.yaml -H "User-Agent: clash2singbox (Clash ClashMeta clash.meta)" 'https://example.com'
// tinygo build -o clash2singbox.wasm -target wasm -opt z -gc leaking -scheduler none --no-debug wasm.go
// node --experimental-detect-module main.js
