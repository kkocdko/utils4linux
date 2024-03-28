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
      // 切分边界
      const bound =
        /[\s\t\-\|_\u00FF-\u4E00\u9FFF-\uFFFF]|(?<![\d\.]|hy|ipv)(?=\d)|(?<=香港|美国|新加坡|荷兰|日本)/g;
      const parts = e.tag
        .toLowerCase()
        .replace("hong kong", "hk")
        .replace("united states", "us")
        .replace("tai wan", "tw")
        .split(bound);
      const tag = parts.reduce((prev, cur) => {
        if (!cur?.length) return prev;
        if (/^(hk|hongkong|香港)$/.test(cur)) cur = "hk";
        if (/^(tw|taiwan|台湾)$/.test(cur)) cur = "tw";
        if (/^(jp|japan|日本)$/.test(cur)) cur = "jp";
        if (/^(sg|singapore|新加坡|狮城)$/.test(cur)) cur = "sg";
        if (/^(us|united-states|美国)$/.test(cur)) cur = "us";
        if (/^(nl|holland|荷兰)$/.test(cur)) cur = "nl";
        if (/^(de|germany|德国)$/.test(cur)) cur = "de";
        if (/^(kr|south-korea|韩国)$/.test(cur)) cur = "kr";
        if (/^(ru|russia|俄罗斯)$/.test(cur)) cur = "ru";
        if (/^(uk|united-kingdom|英国)$/.test(cur)) cur = "uk";
        if (/^(ca|canada|加拿大)$/.test(cur)) cur = "ca";
        if (/^(ph|philippines|菲律宾)$/.test(cur)) cur = "ph";
        if (/^(in|india|印度)$/.test(cur)) cur = "in";
        if (/^(th|thailand|泰国)$/.test(cur)) cur = "th";
        if (/^(au|australia|澳大利亚)$/.test(cur)) cur = "au";
        if (/^(pk|pakistan|巴基斯坦)$/.test(cur)) cur = "pk";
        if (/^(cl|chile|智利)$/.test(cur)) cur = "cl";
        if (/^(tr|turkey|土耳其)$/.test(cur)) cur = "tr";
        if (/^(ar|argentina|阿根廷)$/.test(cur)) cur = "ar";
        if (/^(圣何塞)$/.test(cur)) return prev + ".sj";
        if (/^(凤凰城)$/.test(cur)) return prev + ".phx";
        if (/^(洛杉矶)$/.test(cur)) return prev + ".la";
        if (/^(阿姆斯特丹)$/.test(cur)) return prev + ".ams";
        if (/^(亚马逊)$/.test(cur)) cur = "aws";
        if (/^(香港电讯)$/.test(cur)) cur = "hkt";
        if (/^(reliablesite)$/.test(cur)) cur = "rs";
        if (/^(高速专线|专线|iplc)$/.test(cur)) cur = "i";
        if (/^(高速)$/.test(cur)) cur = "f";
        if (/^(流媒体)$/.test(cur)) cur = "m";
        if (/^(家宽带|home)$/.test(cur)) cur = "h";
        if (/^(下载专用|下载|bt支援)$/.test(cur)) cur = "dl";
        if (/^(ipv6)$/.test(cur)) cur = "v6";
        if (/^(\d+)$/.test(cur)) cur = cur.replace(/^0+/g, "");
        if (/倍计费|\d倍|x\d|\dx/.test(cur))
          cur = "x" + cur.match(/[\d\.]+/)[0];
        const extra =
          /^(龙涯门|油海七珍|南半球纽约|婆罗多|尼日利亚|坎提普尔|南朝鲜|足球王国|麥克默多站|潘帕斯雄鹰|世界之都日耳曼尼亚|葡萄酒之国|千堡之国|袖珍王国|西非天府之国|第三罗马|奥斯曼苏丹国|大不列颠及北爱尔兰联合王国)$/g;
        if (extra.test(cur)) return prev;
        if (!prev.endsWith("-x")) prev += "-";
        return prev + cur;
      }, name);
      delete e.tag;
      delete e.down_mbps; // always bbr
      delete e.up_mbps;
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
