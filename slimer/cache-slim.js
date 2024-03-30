/*
# cache-slim.js
Util for slimming apps cache.
## Features
- Analyze the cache directory.
- Slim unused or unimportant files.
- Choose slim method, like compress, delete, or replace by dummy files.
- Avoid duplicate compression.
*/
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import zlib from "node:zlib";

console.log("working directory = " + process.cwd());
const storeDir = path.join(process.cwd(), ".cache-slim");
const processedRecordFilePath = path.join(storeDir, "processed-record.bin");
// fs.mkdirSync(storeDir, { recursive: true });

/**
 * @param {string} p input file path
 * @returns {Promise<Buffer>} binary sha256 result, length = 32
 */
const sha256 = (p) => {
  return new Promise((resolve) => {
    const hash = crypto.createHash("sha256");
    hash.on("readable", () => resolve(hash.read()));
    fs.createReadStream(p).pipe(hash);
  });
};

/**
 * @param {fs.promises.FileHandle} fd input file path
 */
const detectFileType = async (fd) => {
  const head = Buffer.alloc(16);
  await fd.read(head, 0, head.length, 0);
  const match = (start, end, expect) =>
    head.subarray(start, end).equals(Buffer.from(expect, "hex"));
  if (match(4, 8, "66747970")) return "mp4";
  if (match(0, 3, "465753")) return "flv";
  if (match(0, 3, "494433")) return "mp3";
  if (match(0, 2, "ffd8")) return "jpeg";
  if (match(0, 4, "89504e47")) return "png";
  if (match(0, 4, "47494638")) return "gif";
  if (match(0, 2, "424d")) return "bmp";
  if (match(0, 2, "4949")) return "tiff";
  if (match(0, 4, "25504446")) return "pdf";
  if (match(0, 4, "504b0304")) return "zip";
  if (match(0, 3, "1f8b08")) return "gzip";
  if (match(0, 4, "75737461")) return "tar";
  if (match(0, 7, "526172211a07")) return "rar";
  return "unknown";
};

const unGzip = ([base64]) => zlib.gunzipSync(Buffer.from(base64, "base64"));

const dummyFiles = {
  // ffmpeg -f lavfi -i nullsrc=s=4x4:r=1:d=30 -an -c:v libx264 -bf 0 a.mp4
  mp4: unGzip`H4sIADbDBmYCA71VBYzsNhD18ZWZyZ+Ef/ecHH5ImZm5jbyxc4k2TnK2l8rMgnJ7FVZUZhCUmURfUGZmEJS7HS9005Rxbiczb9ieKIcQwr5upKFKBEL9yEhgm1Y9S6QTFvhHfck5QoMHCkY1xJSGh5rNY1/a5f1733l+97svW/ocfn7RJ5/W7akJXMBeIjm2WuruRTCN7bP/LrsVJvAOh+4EPsY9cOyUpI2I+xrbhIwXbGKPgzHQOl0+Nlar1YrVkPEkonExkbNjpm4x0CKCmCTVYRKr5dijJeo5Fpbcd8Yx46Uo8cqOtZwsJ5jGNGoo7pD6+HJSt6xxLLgT8DpWlRJo0zhVDUiFpyuZYxUJJMEDi7DOmWsqWpDhShrPcseawl4gE0FdAQBryaMoVKDN1GeYp0Hx5oRDYATKjkti7tjWUsvCPlXaTVU5TCGiU2AudRPfV1w7BRvrQEKGKRQlSZkGANyeTUWhx3sGgmPZ6uGFgmozRxhrLiMKQWAvRRVJG66XiJRqwB5ckZY0jKEEBEpqYnxJBTelajycDXTq2LjMG+B27EnSUV0Rxqa7x2PuVbQzQXAr31yK5CqAbOm5Pw0MfsCOJ30sSlpyMxgAxx4vEjxnxnFIcQrU1NRtSVp3ppaBojRPnQkcpnDNsFLYAtSic7BBsw90CkJoI37OGUPNHz457b6h6fMuTh4+BF9vbXu2eR13mF+xrtv84TPQ19hhfr9R9hSFwM8BrrnDvKzv9OQlD5wG7ja+qIs7/ttyeFUOf/FzfNX62XqA7Rw+MBcvc/6Lcvi2XPyqHM71n8/1n7dzuNP/j8//2R+c/7M/OD/gf3D+V8GfPf/9Bg9cLZKkCvZIVAOGMgS+9xCqENSH4JchA34Hb49+l/rh94yWtAz60brc6jmQr9bqa+iv9h1sM9BizrQCuSWPlO5lVEgvt39nwUIKChYM5shXGzkFHfJICxQCFsmux3wZs5GHAk52pzGLuDSVPxVh7IOyYVUELDfmYtb2bckk9zPHWLMiI9zW+25WuhSBfr/SimVibjb/Dno4R4PwtztI4HbERntD/BQpjk8VLUJwFJbMVzyTsWmzCc9JiNqpj6HVm6+jTWdB3nDbdiu/Gj3FLMU8+kbO3WBxHxoOPnz46YUPfP/VVyZ13ZSq1DTp8IYlLXWn72LDprzSWmXG3bqzoQ3hWFm74S3B5uVsW3fkBeA7LjM22PtPNlcGvI6Z5X9kmN1LMnMS4FKFaQrySMFBtmlB9n0RLJQ0TSOUoULYfimXXKsTU3ArRjXt7hUW58PibGIW9yMl74NQHAgAAA==`,
  flv: unGzip`H4sIADzEBmYCA0xTA9D8RhTfz67NrZ3b5DO2tj1uZm/zctm56DZ7HNS23Y7VDmp7VHdY225Hde//ko9vJs/vt/rl2JPP7ekhhIwQlK0IeZIsSy8ZTeJTwIijhRHDmBgmw15dC6OSmBx+6ErXQFN5JiCHb7ESDwagKoFZT0w0lAeJhxg4CmRNRnwtIihyh/22khsvemXigVQeOXyXlfQQxHlO95KJk0XDn2GWwyybMTLsqxAy1QFy+P0Hr+Li9woqZyXePlc9Hhntfk52qKB98OHDlv4cvoCQPpKrnqErt967B/f94yuv7/nif3/+SVD4COm9ZBWgZ/k6yoMD3e55Hx3z/XPfvH/8E7cd/B59f69ffm05M1P0ECoTDdQu3OMtTJVOOf2Y4w6ZokecexQtzoOFo5K0HYJvqMPY5CEOcyYxGRiTLpRKzWbTKg4fithKdKWU41qBiULsSdL8zrMFKkVZSG5TDT6fpB6Uw0RWub3AFhgVsQjbGXDWmlxgLduepBHwAFo0q5fRm6Vp1sZR1K72uG0xHEJFI9UCz80RbZxwtYgrwO0ZKgOdRMKNMKBGQxiqDL251pwnDTqyFnGGWxBeJ4mBO/bBtk19kRk3zaoqxY4VgFrqJr6fgeGHONQEGidyoDBJqiLAwF3PZaGSsJ5gNNaocjJEwgA2qNiADgU2Yb4cIhnbrkyiVBiMJV6R0ULFCKFi9PKegmQ5VLOgZcodWoU2lrkzzVZcN1IxgmcSYpB1w6cYLebzS9GQBTitpbu2YaxjzKX2aVQ2GgBnMeDOpMVoLd8OZ9YMummOW1jR4jPz6GQGUj5FVeoWvxG+AmKJGr5g/h45Hcm2cMUlA93/f7no+YHZq25OXjmHPmAfejnS73rk9Jak7zuCsl8PKWT4iLsWt3C7//+G/i5Y34YMvbOxPnbEXacNe68JBPwdw91HEJ+MbdoOZCU8jrOKKpxPTjnQBDFGAayGfwGamkkwNR/haoQ70NRswlQjXoCm5hKmGukINDWfMNXIO6CqmS2E6WZlDTQ1Rphq1AXQ1ARh2qX1A00NlvDRe4CmZhKmGqMTaGqwhI/ZBjQ1WMLHagaaGizhY9eAFoZYwscpA00NlvBxC0BTgyV8vCwIpx8/BTQ1WMIniINw+gn9gJ5+MM2JvEE4/cQeQE8/mGoSVxBOP6kTCKefzArC6Sc3AXv6uY9kTqEH9vSzH66GFapGnAmiRgAAk9MoOcsHAAA=`,
  bmp: unGzip`H4sIAMrIBmYCA3LybWOAgDIg1gBiFihmBJL4AKBqcAMAIAYB6HOb29zmNre5zS23ueWWW2655ZZbx/c+YwzmnKy12HtzzuHei4jw3kNVMTPcnYggM6kquhsRfn9jJXPJhgAAAA==`,
  png: unGzip`H4sIAMrIBmYCA+sM8HPn5ZLiYmBg4PX0cAkC0iwgDCIYPLN0FgMpHk8Xx5AKxmQN/XZlBrEY5p3nxVjzwfKufi7rnBKaAH8CdjlFAAAA`,
  jpeg: unGzip`H4sIAMrIBmYCA6XMAQbDQBBG4ffvLIrSHXqCXqQoS3vqIodIEshNJhYgWWAf4MOLOXbKr34rEghBbHyIwdpEMdofv5HJphfJZa6YeCJONS1dVVf9qit3E8nNecMjlgMsXmgMGwEAAA==`,
  tiff: unGzip`H4sIAMrIBmYCA0XKAQaAQBBA0TftSgIbKugE3WRv1rGDYT54+HO+Br5sJ5pAR5QtZS0dWNNwRBfYcNbjShvc9XjqAT+NNmzpjgAAAA==`,
  gff: unGzip`H4sIAMrIBmYCA3P3dLMwT2RhYGFYxAACgoKCSkpKxsbGLi4uoaGhaWlp5eXlOiAZkBomZpaKXXemM1gDAGh2huU3AAAA`,
};

Object.entries(dummyFiles).forEach(([s,b])=>{
  fs.writeFileSync("dummy."+s,b)
})
process.exit()

const files = (
  await Promise.allSettled(
    (
      await fs.promises.readdir(process.cwd(), {
        recursive: true,
        withFileTypes: true,
      })
    )
      .filter((v) => v.isFile())
      .map(async (v) => {
        const p = path.join(v.path, v.name);
        const fd = await fs.promises.open(p, "r");
        const type = await detectFileType(fd);
        const size = (await fd.stat()).size;
        await fd.close();
        return { path: p, type, size };
      })
  )
).map((v) => v.value);

// file rename
for (const file of files) {
  if (dummyFiles[file.type]) {
    const suffix = ".slim." + file.type;
    if (file.path.endsWith(suffix)) {
      console.warn(file);
      // fs.renameSync(file.path, file.path.slice(0, -suffix.length));
    } else {
      // console.warn(file);
      fs.renameSync(file.path, file.path + suffix);
    }
  }
}

// file dummy replacement

// file compress

process.exit();

console.log(files);

const html = ([s]) => s;
const pageHtml = html`
  <!DOCTYPE html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>cache-slim</title>
  </head>
  <style></style>
  <body>
    <div></div>
  </body>
`;
const pageScript = () => {};

// create and listen server on :9329, have "/" and "/api" routes
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`${pageHtml}<script>\n${pageScript.toString()}\n</script>\n`);
    return;
  }
  if (req.url === "/api/list") {
    res.writeHead(200, { "Content-Type": "text/json; charset=utf-8" });
    res.end(JSON.stringify(files));
    return;
  }
});
server.listen(9329);

// console.log(await sha256("a"));
// console.log(await detectFileType("a"));
// console.log(await detectFileType("b"));
// console.log(await detectFileType("c"));
// console.log(await detectFileType("d"));
// console.log(await detectFileType("e"));
// console.log(await detectFileType("f"));
// process.exit(0);

// node --experimental-detect-module cache-slim.js
