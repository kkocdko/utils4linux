// https://registry.npmmirror.com/$
await import("/js-yaml/4.1.0/files/dist/js-yaml.js");
document.body.children[0].innerHTML = `<style>body>pre{display:grid;height:calc(100vh - 32px);grid:auto 1fr/auto;gap:8px}textarea{font-family:monospace;text-wrap:nowrap}btn_bar_{display:flex}</style><btn_bar_><button id="$btn">Tidy</button></btn_bar_><textarea id="$i" placeholder="- { name: foo-us-2-x0.1, server: 1.1.1.1, port: 443, type: trojan, password: pwd }\n- { name: bar-jp, server: 1.1.1.1, port: 443, type: ss, password: pwd }\n- { name: bar-sg-x10, server: 1.1.1.1, port: 38200, type: vmess, password: pwd }"></textarea>`;
$btn.addEventListener("click", () => {
  const prefix = prompt("prefix") + "-";
  const v = jsyaml.load($i.value.trim().replace(/\s*\n\s*/g, "\n"));
  for (const entry of v)
    entry.name = (prefix + entry.name)
      .replace(/[\s_\|\u00FF-\u4E00\u9FFF-\uFFFF]/g, "-") // remove emoji, keep cjk chars \u4E00-\u9FFF
      .replace(/-+/g, "-");
  const opts = { lineWidth: -1, forceQuotes: false, flowLevel: 1 };
  $i.value = jsyaml.dump(v, opts);
});
