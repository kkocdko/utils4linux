/*

history prompts:

我现在想做点有趣的事情。我们的目标是在 mp4 容器中存储任意数据。用 nodejs 写。我给你个开头，之后要写进单个 any2store.js 中。

```js
import fs from "node:fs";
// use fs stream
// use process.argv , find the last 2 args as input and output, if the last one is mp4 , store to mp4, if last one is not mp4, extract from mp4
```

能完成之后，使用 file 命令查看 store.mp4 ，确保它能被识别成 mp4 文件。然后，我们用 any2store.js 来复刻这个实现，不再依赖 ffmpeg。

最终，应当能够 `node any2store.js raw.bin store.mp4` 实现此功能。

在 any2store.js 只应当包含存储和提取功能，之后我们另外运行 sha1sum。

mp4 中有多种存储方法，对吧，无论如何，我们存储进 mp4 的时候都必须是原样存储数据，禁止编码成 base64 或者其他的变换。我可以接受 mp4 文件变得不那么规范。

你能理解吗？如果有疑问就问我。

```
# 我们有一个这样的场景：很多网盘会对上传文件做合规性扫描，如果发现加密文件，就会警告。
# 因此，现在我的想法是，使用 mp4 容器，将加密后的数据放入。这样的话，就可以让网盘运营方看到我们上传的是 mp4 格式文件。
# 不能仅仅修改 `.mp4` 扩展名，我们必须构建出一个正确的，或者是拟真度很高的 mp4 文件。
```

*/

import fs from "node:fs";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const identifier = encoder.encode("any2store-v3\0\0\0\0");
const sampleRate = 48000;
const blockSize = 1024 * 1024;
const randomBytes = (length) => crypto.getRandomValues(new Uint8Array(length));

function concat(...parts) {
  const bytes = parts.map(part => typeof part === "string" ? encoder.encode(part) : part);
  const result = new Uint8Array(bytes.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of bytes) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function encryptedSize(size) {
  return size + Math.max(1, Math.ceil(size / blockSize)) * 16;
}

function u32(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value);
  return bytes;
}

function u64(value) {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(value));
  return bytes;
}

function box(type, ...parts) {
  const payload = concat(...parts);
  return concat(u32(payload.length + 8), type, payload);
}

function fullBox(type, version, flags, ...parts) {
  return box(type, u32(version * 0x1000000 + flags), ...parts);
}

function movie(sampleCount, dataOffset) {
  const duration = u64(sampleCount);
  const times = new Uint8Array(16);
  const matrix = concat(u32(0x10000), u32(0), u32(0), u32(0), u32(0x10000), u32(0), u32(0), u32(0), u32(0x40000000));
  const mvhd = fullBox("mvhd", 1, 0, times, u32(sampleRate), duration, u32(0x10000), [1, 0], new Uint8Array(10), matrix, new Uint8Array(24), u32(2));
  const tkhd = fullBox("tkhd", 1, 3, times, u32(1), u32(0), duration, new Uint8Array(8), [0, 0, 0, 0, 1, 0, 0, 0], matrix, new Uint8Array(8));
  const mdhd = fullBox("mdhd", 1, 0, times, u32(sampleRate), duration, [0x55, 0xc4, 0, 0]);
  const hdlr = fullBox("hdlr", 0, 0, u32(0), "soun", new Uint8Array(12), "SoundHandler\0");
  const sampleEntry = box("ipcm", [0, 0, 0, 0, 0, 0, 0, 1], new Uint8Array(8), [0, 1, 0, 16, 0, 0, 0, 0], u32(sampleRate * 65536), fullBox("pcmC", 0, 0, [1, 16]));
  const stsd = fullBox("stsd", 0, 0, u32(1), sampleEntry);
  const stts = fullBox("stts", 0, 0, u32(sampleCount ? 1 : 0), ...(sampleCount ? [u32(sampleCount), u32(1)] : []));
  const stsc = fullBox("stsc", 0, 0, u32(sampleCount ? 1 : 0), ...(sampleCount ? [u32(1), u32(sampleCount), u32(1)] : []));
  const stsz = fullBox("stsz", 0, 0, u32(2), u32(sampleCount));
  const co64 = fullBox("co64", 0, 0, u32(sampleCount ? 1 : 0), ...(sampleCount ? [u64(dataOffset)] : []));
  const dinf = box("dinf", fullBox("dref", 0, 0, u32(1), fullBox("url ", 0, 1)));
  const minf = box("minf", fullBox("smhd", 0, 0, new Uint8Array(4)), dinf, box("stbl", stsd, stts, stsc, stsz, co64));
  return box("moov", mvhd, box("trak", tkhd, box("mdia", mdhd, hdlr, minf)));
}

async function readAt(input, position, length, message = "Truncated MP4.") {
  const buffer = new Uint8Array(length);
  let completed = 0;
  while (completed < length) {
    const { bytesRead } = await input.read(buffer, completed, length - completed, position + completed);
    if (!bytesRead) throw new Error(message);
    completed += bytesRead;
  }
  return buffer;
}

function safeNumber(value) {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("MP4 offset is too large.");
  return Number(value);
}

// main logic starts here

if (process.argv.length !== 4) {
  throw new Error("usage: node any2store.js <the_password> <input_file> (input .m4a decrypts; otherwise encrypts)");
}
const [password, inputPath] = process.argv.slice(2);
const storing = !inputPath.endsWith(".m4a");
const outputPath = storing ? inputPath + ".m4a" : inputPath.slice(0, - 4);
if (!password) throw new Error("Password must not be empty.");
const input = await fs.promises.open(inputPath, "r");
let output;
const temporaryPath = outputPath + ".tmp";
const stat = await input.stat();
if (!stat.isFile()) throw new Error("Input must be a regular file.");
if (fs.existsSync(outputPath)) throw new Error("Output already exists.");
let size = stat.size;
let start = 0;
let metadata;
let sampleCount;
if (storing) {
  sampleCount = Math.ceil(encryptedSize(size) / 2);
  if (sampleCount > 0xffffffff) {
    throw new Error("Encrypted payload exceeds the supported limit of 8 GiB minus 2 bytes.");
  }
  metadata = concat(identifier, u64(size), randomBytes(16), randomBytes(12));
} else {
  let position = 0;
  let originalSize;
  let media;
  let hasFtyp = false;
  while (position < size) {
    if (size - position < 8) throw new Error("Invalid MP4 box header.");
    const header = await readAt(input, position, 8);
    const type = decoder.decode(header.subarray(4, 8));
    let boxSize = new DataView(header.buffer).getUint32(0);
    let headerSize = 8;
    if (boxSize === 1) {
      if (size - position < 16) throw new Error("Invalid extended MP4 box header.");
      boxSize = safeNumber(new DataView((await readAt(input, position + 8, 8)).buffer).getBigUint64(0));
      headerSize = 16;
    } else if (boxSize === 0) {
      boxSize = size - position;
    }
    if (boxSize < headerSize || boxSize > size - position) {
      throw new Error("Invalid MP4 box size.");
    }
    if (type === "ftyp") hasFtyp = true;
    if (type === "uuid" && boxSize - headerSize >= 16) {
      const uuid = await readAt(input, position + headerSize, 16);
      if (uuid.every((byte, index) => byte === identifier[index])) {
        if (originalSize !== undefined || boxSize - headerSize !== 52) {
          throw new Error("Invalid any2store metadata.");
        }
        metadata = await readAt(input, position + headerSize, 52);
        originalSize = safeNumber(new DataView(metadata.buffer).getBigUint64(16));
      }
    }
    if (type === "mdat") {
      if (media) throw new Error("Multiple media boxes are not supported.");
      media = { start: position + headerSize, length: boxSize - headerSize };
    }
    position += boxSize;
  }
  if (!hasFtyp || originalSize === undefined || !media) {
    throw new Error("Expected an encrypted v3 MP4 created by any2store.js.");
  }
  if (media.length !== encryptedSize(originalSize) + originalSize % 2) {
    throw new Error("Stored length does not match the media box.");
  }
  start = media.start;
  size = originalSize;
}
const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
const keyAlgo = { name: "PBKDF2", salt: metadata.subarray(24, 40), iterations: 60000, hash: "SHA-256" };
const key = await crypto.subtle.deriveKey(keyAlgo, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
output = await fs.promises.open(temporaryPath, "wx", 0o600);
if (storing) {
  const ftyp = box("ftyp", "isom", u32(512), "isomiso2mp41");
  const uuid = box("uuid", metadata);
  const offset = ftyp.length + movie(sampleCount, 0).length + uuid.length + 16;
  await output.writeFile(concat(ftyp, movie(sampleCount, offset), uuid, u32(1), "mdat", u64(sampleCount * 2 + 16)));
}
const blockCount = Math.max(1, Math.ceil(size / blockSize));
for (let index = 0; index < blockCount; index++) {
  const length = Math.min(blockSize, size - index * blockSize) + (storing ? 0 : 16);
  const chunk = await readAt(input, start, length, "Input was truncated while reading.");
  start += length;
  const iv = metadata.slice(40, 52);
  const view = new DataView(iv.buffer);
  view.setUint32(8, (view.getUint32(8) ^ index) >>> 0);
  const parameters = { name: "AES-GCM", iv, tagLength: 128, additionalData: concat(metadata, u32(index)) };
  let result;
  if (storing) {
    result = await crypto.subtle.encrypt(parameters, key, chunk);
  } else {
    try {
      result = await crypto.subtle.decrypt(parameters, key, chunk);
    } catch {
      throw new Error("Wrong password or damaged encrypted data.");
    }
  }
  await output.writeFile(new Uint8Array(result));
}
if (storing) {
  if ((await input.stat()).size !== size) throw new Error("Input size changed while storing.");
  if (size % 2) await output.writeFile(new Uint8Array(1));
}
await input.close();
await output?.close();
fs.renameSync(temporaryPath, outputPath)
fs.rmSync(temporaryPath, { force: true });
