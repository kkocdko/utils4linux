import fs from "node:fs";
const inputStr = fs.readFileSync("./dist/config.jsonc").toString();
const subs = inputStr.match(/(?<=\/\/ ).+ - https?:.+/g);
const gen = async (/** @type {string} */ sub) => {
  const parts = sub.split(" ");
  const [name, url] = [parts[0], parts.at(-1)];
  console.log(name + ": begin");
  console.time(name);
  const ua = "SFA/1.12.14 (595; sing-box 1.12.14; language en_US)";
  const res = await fetch(url, { headers: { "User-Agent": ua } });
  const obj = await res.json();
  const outbounds = [];
  const MAX_I = 4;
  const store = [
    ["emby", { i: 1, r: /emby/ }],
    ["hk", { i: 1, r: /hong\-?kong|香港|🇭🇰/ }],
    ["tw", { i: 1, r: /tai\-?wan|台湾|🇹🇼/ }],
    ["sg", { i: 1, r: /singapore|新加坡|狮城|🇸🇬/ }],
    ["in", { i: 1, r: /india|印度|🇮🇳/ }],
    ["jp", { i: 1, r: /japan|日本|🇯🇵/ }],
    ["kr", { i: 1, r: /korea|韩国|🇰🇷/ }],
    ["lu", { i: 1, r: /luxembourg|卢森堡|🇱🇺/ }],
    ["au", { i: 1, r: /australia|澳大利亚|🇦🇺/ }],
    ["nl", { i: 1, r: /netherlands|荷兰|🇳🇱/ }],
    ["us-d", { i: 1, r: /美国直连/ }],
    ["us", { i: 1, r: /united\-?states|美国|🇺🇸/ }],
    ["uk", { i: 1, r: /united\-?kingdom|英国|🇬🇧/ }],
  ];
  let ret = "// " + JSON.stringify(obj.outbounds.map((e) => e.tag)) + "\n";
  for (const e of obj.outbounds.filter((e) => e.server)) {
    e.tag = e.tag.toLowerCase();
    const factor = e.tag
      .match(/[\d\.]+倍|x[\d\.]+|[\d\.]+x/)?.[0]
      ?.match(/[\d\.]+/)?.[0];
    const found = store.find(([k, v]) => v.r.test(e.tag) && v.i <= MAX_I);
    if (!found) continue;
    e.tag = name + "-" + found[0] + "-" + found[1].i++;
    if (factor && parseFloat(factor) !== 1) e.tag += "-x" + factor;
    outbounds.push(e);
  }
  ret += "// " + JSON.stringify(outbounds.map((e) => e.tag)) + "\n";
  const order = ["tag", "detour", "type", "server", "server_port"].reverse();
  const exclude = ["domain_resolver", "down_mbps", "up_mbps"]; // always bbr
  for (const outbound of outbounds) {
    if (outbound.type === "anytls") continue; // 兼容 sing-box 1.11
    delete outbound.domain_resolver;
    const entries = Object.entries(outbound)
      .filter(([k]) => !exclude.includes(k))
      .sort(([a], [b]) => order.indexOf(b) - order.indexOf(a));
    ret += JSON.stringify(Object.fromEntries(entries)) + ",\n";
  }
  console.timeEnd(name);
  return ret;
};
console.log(
  "\n[\n\n" +
    (await Promise.allSettled(subs.map(gen)))
      .flatMap((p) => (p.status === "fulfilled" ? [p.value] : []))
      .join("\n\n") +
    "\n\n]\n",
);
