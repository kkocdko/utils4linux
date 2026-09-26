// @ts-check
import fs from "node:fs";
import http from "node:http";
fs.mkdirSync("cache", { recursive: true });
for (const entry of fs.readdirSync("cache"))
  if (/^cached,debian(-security)?,dists,|^pending,/.test(entry))
    fs.rmSync("cache/" + entry);
const server = http.createServer(async (_, r) => {
  r.setHeader("Cache-Control", "no-store");
  let remote;
  if (r.req.url === "/refresh") {
    return (r.end(), process.exit());
  } else if (
    r.req.url?.startsWith("/debian/") ||
    r.req.url?.startsWith("/debian-security/")
  ) {
    remote = "http://mirrors.jcut.edu.cn" + r.req.url; // bfsu,ustc,nju,jcut
  } else if (
    r.req.url?.startsWith("/archive/debian/") ||
    r.req.url?.startsWith("/archive/debian-security/")
  ) {
    remote = "http://snapshot.debian.org" + r.req.url;
  } else {
    return r.writeHead(404).end();
  }
  const cached = "cache/cached" + r.req.url.replaceAll("/", ","); // windows works fine
  const pending = "cache/pending" + cached.slice("cache/cached".length);
  while (fs.existsSync(pending)) await new Promise((r) => setTimeout(r, 500));
  if (fs.existsSync(cached)) return fs.createReadStream(cached).pipe(r);
  const response = await fetch(remote, { redirect: "follow" });
  if (!response.ok || !response.body) return r.writeHead(400).end();
  const file = fs.createWriteStream(pending);
  try {
    for await (const chunk of response.body) {
      await Promise.allSettled([
        new Promise((resolve) => file.write(chunk, resolve)), // not need to listen drain event, see https://github.com/clevert-app/clevert/issues/12
        new Promise((resolve) => r.write(chunk, resolve)), // continue downloading even if request abort
      ]);
    }
    file.close(() => fs.renameSync(pending, cached)); // use sync call here
  } catch (e) {
    console.error("error: ", e);
    file.close(() => fs.rmSync(pending));
  }
  r.end();
});
server.listen(9630);
/*
# sing-box: { "domain": "deb.debian.org", "process_path": "/usr/lib/apt/methods/http", "action": "route-options", "override_address": "127.0.0.1", "override_port": 9630 }, // http-cache-proxy
# curl http://127.0.0.1:9630/refresh
*/
