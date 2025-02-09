import fs from "node:fs";
const cfg = fs.readFileSync("./dist/config.jsonc").toString();
const subs = cfg.match(/(?<=\/\/\s*)\w+?\s\-\s.+?https?:.+?(?=\n)/g);
const results = await Promise.allSettled(
  subs.map(async (/** @type {string} */ sub) => {
    const parts = sub.split(" ");
    const [name, url] = [parts[0], parts.at(-1)];
    console.log(name + ": begin");
    console.time(name);
    const res = await fetch(url, { headers: { "user-agent": "sing-box" } });
    const parsed = await res.json();
    // console.log(parsed);
    const entries = [];
    const MAX_I = 4;
    const store = [
      ["emby", { i: 1, r: /emby/ }],
      ["hkt", { i: 1, r: /hkt|香港电讯|香港電訊/ }],
      ["hk", { i: 1, r: /hong kong|hong\-kong|香港|🇭🇰/ }],
      ["tw", { i: 1, r: /tai wan|tai\-wan|台湾|🇹🇼/ }],
      ["sg", { i: 1, r: /singapore|新加坡|狮城|🇸🇬/ }],
      ["in", { i: 1, r: /india|印度|🇮🇳/ }],
      ["jp", { i: 1, r: /japan|日本|🇯🇵/ }],
      ["lu", { i: 1, r: /luxembourg|卢森堡|🇱🇺/ }],
      ["nl", { i: 1, r: /netherlands|荷兰|🇳🇱/ }],
      ["us", { i: 1, r: /united states|united\-states|美国|🇺🇸/ }],
      ["uk", { i: 1, r: /united kingdom|united\-kingdom|英国|🇬🇧/ }],
    ];
    for (const e of parsed.outbounds.filter((e) => e.server)) {
      e.tag = e.tag.toLowerCase();
      const factor = e.tag
        .match(/[\d\.]+倍|x[\d\.]+|[\d\.]+x/)?.[0]
        ?.match(/[\d\.]+/)?.[0];
      const found = store.find(([k, v]) => v.r.test(e.tag) && v.i <= MAX_I);
      if (!found) continue;
      e.tag = name + "-" + found[0] + "-" + found[1].i++;
      if (factor) e.tag += "-x" + factor;
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
