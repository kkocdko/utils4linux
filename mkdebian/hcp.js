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
    return r.end(), process.exit();
  } else if (
    r.req.url?.startsWith("/debian/") ||
    r.req.url?.startsWith("/debian-security/")
  ) {
    remote = "http://mirrors.ustc.edu.cn" + r.req.url;
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
  const fileStream = fs.createWriteStream(pending);
  try {
    for await (const chunk of response.body) {
      if (fileStream.writable && !fileStream.write(chunk))
        await new Promise((resolve) => fileStream.once("drain", resolve)); // continue downloading even if request abort
      if (r.writable && !r.write(chunk))
        await new Promise((resolve) => r.once("drain", resolve));
    }
    fileStream.close(() => fs.renameSync(pending, cached)); // use sync call here
  } catch (e) {
    console.error("error: ", e);
    fileStream.close(() => fs.rmSync(pending));
  }
  r.end();
});
server.listen(9630);
/*
# node --experimental-default-type=module hcp.js
# sing-box: { "domain": "deb.debian.org", "process_path": "/usr/lib/apt/methods/http", "action": "route-options", "override_address": "192.168.1.77", "override_port": 9630 }, // hcp
# curl http://192.168.1.77:9630/refresh
rm -rf /etc/apt/sources.list
printf "Types: deb\nURIs: http://192.168.1.77:9630/debian\nSuites: bookworm bookworm-updates bookworm-backports\nComponents: main contrib non-free non-free-firmware\nSigned-By: /usr/share/keyrings/debian-archive-keyring.gpg\n\nTypes: deb\nURIs: http://192.168.1.77:9630/debian-security\nSuites: bookworm-security\nComponents: main contrib non-free non-free-firmware\nSigned-By: /usr/share/keyrings/debian-archive-keyring.gpg\n\n# > https://help.mirrorz.org/debian/\n# http://mirrors.bfsu.edu.cn/debian # and -security\n# http://mirrors.ustc.edu.cn/debian # and -security\n" > /etc/apt/sources.list.d/debian.sources
apt clean all
rm -rf /var/lib/apt/lists/*
apt update
*/
