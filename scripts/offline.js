// 从同一份正式构建生成双击可开的本地交付件。
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
const dir = "dist";
const read = (name) => readFileSync(join(dir, name), "utf8");
const data = (name, mime) =>
  "data:" +
  mime +
  ";base64," +
  readFileSync(join(dir, name)).toString("base64");
let html = read("index.html");
const js = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)[1];
const css = html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)[1];
const styles = read(css).replace(
  /url\(([^)]*?\.woff2)\)/g,
  (_, path) => "url(" + data(join(dirname(css), path), "font/woff2") + ")",
);
html = html
  .replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/, "")
  .replace(
    /<link[^>]+href="[^"]+\.css"[^>]*>/,
    () => "<style>" + styles + "</style>",
  );
html = html
  .replace("./lakeside.webp", () => data("lakeside.webp", "image/webp"))
  .replace("./post.svg", () => data("post.svg", "image/svg+xml"));
html = html.replace(
  "</body>",
  () =>
    '<script type="module">' +
    read(js).replace(/<\/script/gi, "<\\/script") +
    "</script></body>",
);
const fontLicense = read("FONT-LICENSE.txt");
html = html.replace("</head>", () => "<!-- Embedded font license\n" + fontLicense.replaceAll("--", "—") + "\n-->\n</head>");
writeFileSync(join(dir, "旧友邮局.html"), html);
