import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";

const cfg = readFileSync("config.jsonc").toString();
const subs = cfg.match(/(?<=\/\/\s*)\w+?\s\-\s.+?https?:.+?(?=\n)/g);
const results = await Promise.allSettled(
  subs.map(async (/** @type {string} */ sub) => {
    const parts = sub.split(" ");
    const [name, url] = [parts[0], parts.at(-1)];
    console.log(name + ": begin");
    console.time(name);
    const out = `./dist/sub-${name}.json`;
    /** @type {ChildProcessWithoutNullStreams} */
    const child = spawn("./dist/clash2singbox", ["-o", out, "-url", url]);
    await new Promise((r) => child.on("exit", r));
    const parsed = JSON.parse(readFileSync(out).toString());
    rmSync(out);
    let ret = "";
    let tags = [];
    for (const e of parsed.outbounds.filter((e) => e.server)) {
      const tag = (name + "-" + e.tag)
        .replace("×", "x")
        .replace(/[\|\s_\u00FF-\u4E00\u9FFF-\uFFFF]/g, "-") // remove emoji but keep cjk chars \u4E00-\u9FFF
        .replace(/-+/g, "-")
        .toLowerCase();
      delete e.tag;
      tags.push(tag);
      ret += `{"tag":"${tag}",` + JSON.stringify(e).slice(1) + ",\n";
    }
    ret = "// " + JSON.stringify(tags) + "\n" + ret;
    console.timeEnd(name);
    return ret;
  })
);
writeFileSync(
  "./dist/sub.jsonc",
  "// prettier-ignore\n[\n\n" +
    results
      .flatMap((p) => (p.status === "fulfilled" ? [p.value] : []))
      .join("\n\n") +
    "\n\n]\n"
);

// node --experimental-detect-module tidy.js
