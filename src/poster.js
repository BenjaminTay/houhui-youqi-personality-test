import QRCode from "qrcode";
import { landscape } from "./art.js";
const serif = '"Post Serif","Songti SC","Noto Serif CJK SC",serif';
const sans = '"PingFang SC","Microsoft YaHei",sans-serif';
const image = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
function wrap(ctx, text, x, y, width, height) {
  let row = "";
  for (const c of text) {
    if (row && ctx.measureText(row + c).width > width) {
      ctx.fillText(row, x, y);
      row = "";
      y += height;
    }
    row += c;
  }
  ctx.fillText(row, x, y);
}
export async function poster(result, name, url) {
  const profile = result.main;
  const [art, qr] = await Promise.all([
    image(
      "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(landscape(profile.art)),
    ),
    url
      ? QRCode.toDataURL(url, {
          margin: 2,
          width: 176,
          color: { dark: "#263d32", light: "#f8f2e5" },
        }).then(image)
      : null,
    document.fonts.load('700 78px "Post Serif"', profile.name + "后会友期"),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f8f2e5";
  ctx.fillRect(0, 0, 1080, 1440);
  for (let i = -100; i < 1100; i += 88) {
    ctx.fillStyle = i % 176 === -12 ? "#556d66" : "#a84a35";
    ctx.save();
    ctx.translate(i, 0);
    ctx.transform(1, 0, -0.7, 1, 0, 0);
    ctx.fillRect(0, 0, 43, 16);
    ctx.restore();
  }
  ctx.fillStyle = "#243a30";
  ctx.font = "700 39px " + serif;
  ctx.fillText("旧友邮局", 74, 109);
  ctx.font = "24px Georgia";
  ctx.fillText("Old Friends Post", 273, 108);
  ctx.textAlign = "right";
  ctx.font = "23px monospace";
  ctx.fillText("PAR AVION", 1004, 104);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#aea18c";
  ctx.beginPath();
  ctx.moveTo(74, 142);
  ctx.lineTo(1004, 142);
  ctx.stroke();
  ctx.fillStyle = "#e7dbc2";
  ctx.fillRect(75, 183, 930, 565);
  ctx.drawImage(art, 90, 198, 900, 535);
  ctx.fillStyle = profile.color;
  ctx.font = "31px " + sans;
  ctx.fillText("我在《后会友期》里最像", 78, 817);
  ctx.font = "italic 35px Georgia";
  ctx.textAlign = "right";
  ctx.fillText(profile.en, 1000, 817);
  ctx.textAlign = "left";
  ctx.fillStyle = "#243a30";
  ctx.font = "700 82px " + serif;
  ctx.fillText(profile.name, 70, 936);
  ctx.font = "35px " + sans;
  wrap(ctx, profile.reply, 78, 1018, 900, 55);
  ctx.setLineDash([8, 9]);
  ctx.beginPath();
  ctx.moveTo(76, 1110);
  ctx.lineTo(1004, 1110);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "italic 31px Georgia";
  ctx.fillText("To,", 78, 1188);
  ctx.font = "34px " + sans;
  ctx.fillText(name.trim() || "久别重逢的我", 142, 1188, 565);
  ctx.font = "27px " + sans;
  ctx.fillText("第二接近 · " + result.second.name + "     最不像 · " + result.last.name, 78, 1265);
  ctx.fillStyle = "#5d6456";
  ctx.font = "22px " + sans;
  ctx.fillText(qr ? "扫码拆开第一封信" : "旧友邮局 · 友情明信片", 78, 1320);
  if (qr) ctx.drawImage(qr, 800, 1157, 192, 192);
  else {
    ctx.save();
    ctx.translate(885, 1253);
    ctx.rotate(-0.13);
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = 3;
    for (const radius of [78, 69]) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = profile.color;
    ctx.textAlign = "center";
    ctx.font = "24px Georgia";
    ctx.fillText("AIR MAIL", 0, 6);
    ctx.font = "18px " + sans;
    ctx.fillText("旧友邮局", 0, 36);
    ctx.restore();
  }
  ctx.fillStyle = profile.color;
  ctx.fillRect(0, 1416, 1080, 24);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(Error("无法生成图片"))),
      "image/png",
    ),
  );
}
