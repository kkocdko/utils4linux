import fs from "node:fs";
// const sdkUrl = `https://registry.npmmirror.com/ali-oss/6.19.0/files/dist/aliyun-oss-sdk.js`;
const window = globalThis;
const location = { protocol: "http:" };
// eval(await (await fetch(sdkUrl)).text());
eval(fs.readFileSync("./aliosssdk.js").toString());
const store = new OSS({
  region: "oss-cn-hongkong",
  endpoint: "https://oss-cn-hongkong.aliyuncs.com",
  accessKeyId: "x",
  accessKeySecret: "x",
  bucket: "x",
  useFetch: true,
});
console.log(await store.list());

// await import("https://registry.npmmirror.com/ali-oss/6.19.0/files/dist/aliyun-oss-sdk.min.js")
