/*
// du -s $(find -type f) | sort -n
// find -name "Cache_*"
#!/bin/sh
for p in $(find -name "Cache_*"); do
  # mv "$p" "$p.png"
  mv "$p" "$(echo $p | sed -e 's/\.png$//')"
done

*/
let raw = `
`;
let files = new Set(
  raw
    .trim()
    .split(/[\r\n]+/)
    .map((line) => line.split(/\s+/)[1])
);
const html = ([s]) => s;
document.body.innerHTML = html`<style>
  img_list_ {
    display: grid;
    position: fixed;
    background: #777;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 0;
    gap: 2px;
    grid: auto / 1fr 1fr 1fr;
    width: 100vw;
    overflow: hidden scroll;
  }
  img_entry_ {
  }
  img_entry_ img {
    filter: invert(1);
  }
</style>`;
const list = document.createElement("img_list_");
document.body.appendChild(list);
list.style.display = "none";

for (const file of files) {
  const [size, path] = line.split(/\s+/);
  const entry = document.createElement("img_entry_");
  const img = entry.appendChild(document.createElement("img"));
  entry.addEventListener("click", () => {
    files.delete(file);
    files.add(file);
    localStorage.files = [...files.values()].join("\n");
  });
  list.appendChild(el);
  img.src = path;
  // el.append;
  // console.log(path);
  htmlStr += `<img_ style="background-image:url('`;
  htmlStr += path;
  htmlStr += `')" onclick='(localStorage.pathes+="\\n"+"${path}"),console.log(1)'></img_>`;
}
htmlStr += "</img_container_>";
container.style.display = "";
// document.body.innerHTML = htmlStr;
