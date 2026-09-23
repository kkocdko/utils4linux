import fs from "node:fs";
import { pipeline } from "node:stream/promises";

const identifier = Buffer.from("any2store-v1\0\0\0\0");
const sampleRate = 48000;

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value);
  return buffer;
}

function uint64(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(value));
  return buffer;
}

function box(type, ...parts) {
  const payload = Buffer.concat(parts);
  return Buffer.concat([uint32(payload.length + 8), Buffer.from(type), payload]);
}

function fullBox(type, version, flags, ...parts) {
  return box(type, uint32(version * 0x1000000 + flags), ...parts);
}

function movie(sampleCount, dataOffset) {
  const duration = uint64(sampleCount);
  const times = Buffer.alloc(16);
  const matrix = Buffer.concat([
    uint32(0x10000), uint32(0), uint32(0),
    uint32(0), uint32(0x10000), uint32(0),
    uint32(0), uint32(0), uint32(0x40000000),
  ]);
  const mvhd = fullBox("mvhd", 1, 0,
    times, uint32(sampleRate), duration, uint32(0x10000),
    Buffer.from([1, 0]), Buffer.alloc(10), matrix, Buffer.alloc(24), uint32(2));
  const tkhd = fullBox("tkhd", 1, 3,
    times, uint32(1), uint32(0), duration, Buffer.alloc(8),
    Buffer.from([0, 0, 0, 0, 1, 0, 0, 0]), matrix, Buffer.alloc(8));
  const mdhd = fullBox("mdhd", 1, 0,
    times, uint32(sampleRate), duration, Buffer.from([0x55, 0xc4, 0, 0]));
  const hdlr = fullBox("hdlr", 0, 0,
    uint32(0), Buffer.from("soun"), Buffer.alloc(12), Buffer.from("SoundHandler\0"));
  const sampleEntry = box("ipcm",
    Buffer.from([0, 0, 0, 0, 0, 0, 0, 1]), Buffer.alloc(8),
    Buffer.from([0, 1, 0, 16, 0, 0, 0, 0]), uint32(sampleRate * 65536),
    fullBox("pcmC", 0, 0, Buffer.from([1, 16])));
  const stsd = fullBox("stsd", 0, 0, uint32(1), sampleEntry);
  const stts = fullBox("stts", 0, 0, uint32(sampleCount ? 1 : 0),
    ...(sampleCount ? [uint32(sampleCount), uint32(1)] : []));
  const stsc = fullBox("stsc", 0, 0, uint32(sampleCount ? 1 : 0),
    ...(sampleCount ? [uint32(1), uint32(sampleCount), uint32(1)] : []));
  const stsz = fullBox("stsz", 0, 0, uint32(2), uint32(sampleCount));
  const co64 = fullBox("co64", 0, 0, uint32(sampleCount ? 1 : 0),
    ...(sampleCount ? [uint64(dataOffset)] : []));
  const dinf = box("dinf",
    fullBox("dref", 0, 0, uint32(1), fullBox("url ", 0, 1)));
  const minf = box("minf", fullBox("smhd", 0, 0, Buffer.alloc(4)), dinf,
    box("stbl", stsd, stts, stsc, stsz, co64));
  return box("moov", mvhd, box("trak", tkhd, box("mdia", mdhd, hdlr, minf)));
}

async function* storedBytes(input, size) {
  const sampleCount = Math.ceil(size / 2);
  if (sampleCount > 0xffffffff) {
    throw new Error("Input exceeds the supported limit of 8 GiB minus 2 bytes.");
  }
  const ftyp = box("ftyp", Buffer.from("isom"), uint32(512), Buffer.from("isomiso2mp41"));
  const metadata = box("uuid", identifier, uint64(size));
  const placeholder = movie(sampleCount, 0);
  const offset = ftyp.length + placeholder.length + metadata.length + 16;
  yield ftyp;
  yield movie(sampleCount, offset);
  yield metadata;
  yield Buffer.concat([uint32(1), Buffer.from("mdat"), uint64(sampleCount * 2 + 16)]);
  let copied = 0;
  if (size) {
    for await (const chunk of input.createReadStream({ start: 0, end: size - 1, autoClose: false })) {
      copied += chunk.length;
      yield chunk;
    }
  }
  if (copied !== size || (await input.stat()).size !== size) {
    throw new Error("Input size changed while storing.");
  }
  if (size % 2) yield Buffer.from([0]);
}

async function readAt(input, position, length) {
  const buffer = Buffer.alloc(length);
  let completed = 0;
  while (completed < length) {
    const { bytesRead } = await input.read(buffer, completed, length - completed, position + completed);
    if (!bytesRead) throw new Error("Truncated MP4.");
    completed += bytesRead;
  }
  return buffer;
}

function safeNumber(value) {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("MP4 offset is too large.");
  return Number(value);
}

async function payloadRange(input, size) {
  let position = 0;
  let originalSize;
  let media;
  let hasFtyp = false;
  while (position < size) {
    if (size - position < 8) throw new Error("Invalid MP4 box header.");
    const header = await readAt(input, position, 8);
    const type = header.toString("ascii", 4, 8);
    let boxSize = header.readUInt32BE(0);
    let headerSize = 8;
    if (boxSize === 1) {
      if (size - position < 16) throw new Error("Invalid extended MP4 box header.");
      boxSize = safeNumber((await readAt(input, position + 8, 8)).readBigUInt64BE());
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
      if (uuid.equals(identifier)) {
        if (originalSize !== undefined || boxSize - headerSize !== 24) {
          throw new Error("Invalid any2store metadata.");
        }
        originalSize = safeNumber((await readAt(input, position + headerSize + 16, 8)).readBigUInt64BE());
      }
    }
    if (type === "mdat") {
      if (media) throw new Error("Multiple media boxes are not supported.");
      media = { start: position + headerSize, length: boxSize - headerSize };
    }
    position += boxSize;
  }
  if (!hasFtyp || originalSize === undefined || !media) {
    throw new Error("Expected an MP4 created by any2store.js.");
  }
  if (media.length !== originalSize + originalSize % 2) {
    throw new Error("Stored length does not match the media box.");
  }
  return { start: media.start, length: originalSize };
}

async function* extractedBytes(input, range) {
  if (range.length) {
    yield* input.createReadStream({
      start: range.start,
      end: range.start + range.length - 1,
      autoClose: false,
    });
  }
}

async function main() {
  if (process.argv.length < 4) {
    throw new Error("Usage: node any2store.js input output (output .mp4 stores; otherwise extracts)");
  }
  const [inputPath, outputPath] = process.argv.slice(-2);
  const input = await fs.promises.open(inputPath, "r");
  let output;
  let succeeded = false;
  try {
    const stat = await input.stat();
    if (!stat.isFile()) throw new Error("Input must be a regular file.");
    const bytes = /\.mp4$/i.test(outputPath)
      ? storedBytes(input, stat.size)
      : extractedBytes(input, await payloadRange(input, stat.size));
    output = await fs.promises.open(outputPath, "wx");
    await pipeline(bytes, output.createWriteStream({ autoClose: false }));
    succeeded = true;
  } finally {
    await input.close();
    if (output) {
      await output.close();
      if (!succeeded) await fs.promises.unlink(outputPath);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

// ffmpeg -i video.mp4 -f s16le -ar 48000 -ac 1 -i raw.bin -map 0:v -map 1:a -c copy -movflags +faststart ffmpeg.store.mp4
