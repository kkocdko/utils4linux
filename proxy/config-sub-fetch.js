import fs from "node:fs";
import child_process from "node:child_process";

const cfg = fs.readFileSync("./dist/config.jsonc").toString();
const subs = cfg.match(/(?<=\/\/\s*)\w+?\s\-\s.+?https?:.+?(?=\n)/g);
const results = await Promise.allSettled(
  subs.map(async (/** @type {string} */ sub) => {
    const parts = sub.split(" ");
    const [name, url] = [parts[0], parts.at(-1)];
    console.log(name + ": begin");
    console.time(name);
    const out = `./dist/config-sub-${name}.json`;
    // curl -H "User-Agent: sing-box" -L "https://example.com"
    /** @type {child_process.ChildProcessWithoutNullStreams} */
    const child = child_process.spawn("./dist/clash2singbox", [
      "-o",
      out,
      "-url",
      url,
    ]);
    await new Promise((r) => child.on("exit", r));
    const parsed = JSON.parse(fs.readFileSync(out).toString());
    fs.rmSync(out);
    const entries = [];
    const MAX_I = 4;
    const store = new Map();
    store.set("emby", { i: 1, r: /emby/ });
    store.set("hkt", { i: 1, r: /hkt|香港电讯|香港電訊/ });
    store.set("hk", { i: 1, r: /hong kong|hong\-kong|香港|🇭🇰/ });
    store.set("tw", { i: 1, r: /tai wan|tai\-wan|台湾|🇹🇼/ });
    store.set("sg", { i: 1, r: /singapore|新加坡|狮城|🇸🇬/ });
    store.set("jp", { i: 1, r: /japan|日本|🇯🇵/ });
    store.set("lu", { i: 1, r: /luxembourg|卢森堡|🇱🇺/ });
    store.set("nl", { i: 1, r: /netherlands|荷兰|🇳🇱/ });
    store.set("us", { i: 1, r: /united states|united\-states|美国|🇺🇸/ });
    store.set("uk", { i: 1, r: /united kingdom|united\-kingdom|英国|🇬🇧/ });
    for (const e of parsed.outbounds.filter((e) => e.server)) {
      // let tag = e.tag;
      let tag = "";
      e.tag = e.tag.toLowerCase();
      for (const [k, v] of store.entries()) {
        if (v.r.test(e.tag) && v.i <= MAX_I) {
          tag = name + "-" + k + "-" + v.i++;
          break;
        }
      }
      if (tag === "") {
        for (const [k, v] of store.entries()) {
          if (e.tag.includes(k) && v.i <= MAX_I) {
            tag = name + "-" + k + "-" + v.i++;
            break;
          }
        }
      }
      if (tag === "") continue;
      const factor = e.tag
        .match(/[\d\.]+倍|x[\d\.]+|[\d\.]+x/)?.[0]
        ?.match(/[\d\.]+/)?.[0];
      if (factor) tag += "-x" + factor;
      e.tag = tag;
      entries.push(e);
    }
    entries.sort((a, b) => (a.tag < b.tag ? -1 : 1));
    let ret =
      "// " +
      JSON.stringify(parsed.outbounds.map((e) => e.tag)) +
      "\n// " +
      JSON.stringify(entries.map((e) => e.tag)) +
      "\n";
    for (const e of entries) {
      const tag = e.tag;
      delete e.tag;
      delete e.down_mbps; // always bbr
      delete e.up_mbps;
      ret += `{"tag":"${tag}",` + JSON.stringify(e).slice(1) + ",\n";
    }
    console.timeEnd(name);
    return ret;
  })
);
fs.writeFileSync(
  "./dist/config-sub.jsonc",
  "// prettier-ignore\n[\n\n" +
    results
      .flatMap((p) => (p.status === "fulfilled" ? [p.value] : []))
      .join("\n\n") +
    "\n\n]\n"
);
