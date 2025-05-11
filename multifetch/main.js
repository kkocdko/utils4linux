// @ts-check
// node --experimental-default-type=module main.js --output /tmp/o.zip --url https://bn.d.miui.com/OS2.0.2.0.ULKCNXM/matisse-ota_full-OS2.0.2.0.ULKCNXM-user-14.0-c6fec65231.zip --url https://cdnorg.d.miui.com/OS2.0.2.0.ULKCNXM/matisse-ota_full-OS2.0.2.0.ULKCNXM-user-14.0-c6fec65231.zip

// https://bn.d.miui.com/OS2.0.2.0.ULKCNXM/matisse-ota_full-OS2.0.2.0.ULKCNXM-user-14.0-c6fec65231.zip
// https://bigota.d.miui.com/OS2.0.2.0.ULKCNXM/matisse-ota_full-OS2.0.2.0.ULKCNXM-user-14.0-c6fec65231.zip
// https://cdnorg.d.miui.com/OS2.0.2.0.ULKCNXM/matisse-ota_full-OS2.0.2.0.ULKCNXM-user-14.0-c6fec65231.zip
// bigota.d.miui.com
// hugeota.d.miui.com

import fs from "node:fs";
const exitByErr = (e) => {
  console.error(e);
  process.exit(1);
};
const getArgs = (k) => {
  const f = (ret, v, i, arr) => (i && arr[i - 1] === k && ret.push(v), ret);
  return process.argv.reduce(f, []);
};
const output = getArgs("--output")[0];
const urls = getArgs("--url");
const threadsPerUrl = +getArgs("--threads-per-url")[0] || 16;
const chunkSize = +getArgs("--chunk-size")[0] || 1024 * 1024 * 4;
const contentLengthTests = urls.map(async (url) => {
  const r = await fetch(url, { method: "HEAD", redirect: "follow" });
  if (!r.headers.get("accept-ranges"))
    exitByErr(new Error("server does not supports ranges"));
  return Number(r.headers.get("content-length"));
});
const totalSize = await Promise.all(contentLengthTests)
  .then((arr) => {
    if (!arr.every((v) => v === arr[0]))
      exitByErr(new Error(`size not the same, arr = ${JSON.stringify(arr)}`));
    return arr[0];
  })
  .catch((e) => exitByErr(e));
const ranges = [];
for (let i = 0; i < totalSize; i += chunkSize)
  ranges.push({ first: i, last: Math.min(i + chunkSize, totalSize) - 1 });

fs.writeFileSync(output, "");
fs.truncateSync(output, totalSize);
const file = await fs.promises.open(output, "r+");

let mutex = null;
const downloadRange = async (url, range) => {
  try {
    console.info(`fetching [${range.first}-${range.last}] from ${url}`);
    const response = await fetch(url, {
      redirect: "follow",
      headers: { range: `bytes=${range.first}-${range.last}` },
    });
    if (response.status !== 206)
      exitByErr(new Error(`fetch error, status = ${response.status}`));
    const buffer = new Uint8Array(await response.arrayBuffer());
    await mutex;
    mutex = file.write(buffer, 0, buffer.byteLength, range.first);
  } catch (e) {
    console.warn(`will retry [${range.first}-${range.last}] later error = `, e);
    ranges.unshift(range);
  }
};
const workers = [];
for (let i = 0; i < urls.length * threadsPerUrl; i++) {
  if (i%threadsPerUrl===0){
    console.log("waiting for switch proxy manually")
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  const url = urls[i % urls.length];
  workers.push(
    (async () => {
      for (let range; (range = ranges.shift()); )
        await downloadRange(url, range);
    })()
  );
}
await Promise.all(workers);
await file.close();
console.info("download complete");
