import "./style.css";
import "./type.css";
import {
  chapters,
  dimensions,
  profiles,
  questions,
  sources,
} from "./content.js";
import { classify, distinguishingAxis } from "./scoring.js";
import { landscape, stamp, postmark } from "./art.js";
import { read, save, blank } from "./state.js";
import { poster } from "./poster.js";

const app = document.querySelector("#app"),
  dialog = document.querySelector("#dialog"),
  body = document.querySelector("#dialog-body");
let session = read(),
  transition,
  busy = false,
  imageUrl = "",
  shareFile = null;
const num = (n) => String(n).padStart(2, "0");
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const count = questions.length;
const cover = document.querySelector("meta[name=cover]").content;
const arrow = '<span aria-hidden="true">↗</span>';
function button(label, action) {
  return (
    '<button class="primary" data-do="' +
    action +
    '">' +
    label +
    arrow +
    "</button>"
  );
}
function home() {
  const has = session.answers.length > 0,
    done = session.answers.length === count;
  return (
    '<section class="hero"><div class="hero-copy"><div class="air"><span></span> 航空信笺 <i>PAR AVION</i></div><p class="salute" lang="en">Dear old friend,</p><h1>后会友期<span>。</span></h1><h2>重逢时，你最像哪位嘉宾？</h2><p class="intro">从一条久违的消息，到分别前没说完的话。<br>拆开四封信，在八位同行嘉宾里找到最像你的那一位。</p><div class="home-action">' +
    button(done ? "查看我的回信" : has ? "继续读信" : "拆开第一封信", "start") +
    '<span class="meta">' +
    count +
    ' 道选择 <i>·</i> 约 4 分钟</span></div></div><figure class="hero-photo"><div class="photo-back"></div><div class="print"><div class="tape"></div><img src="' +
    cover +
    '" alt="湖畔的两把空椅子，一起望向远山" fetchpriority="high"><figcaption><span>寄自 · 重逢的路上</span><i>Wish you were here.</i></figcaption></div>' +
    postmark +
    '</figure></section><section class="route"><div class="route-head"><div><span class="short-line"></span><h2>四封来信</h2></div><i>The correspondence</i></div><div class="stops">' +
    chapters
      .map(
        (c, i) =>
          '<button data-letter="' +
          i +
          '" aria-label="预读第' +
          (i + 1) +
          "封，" +
          c.name +
          '">' +
          stamp(c.art, "NO. " + num(i + 1)) +
          "<span><small>LETTER " +
          num(i + 1) +
          "</small><b>" +
          c.name +
          "</b></span></button>",
      )
      .join("") +
    "</div></section>"
  );
}
function letter() {
  const i = Math.floor(session.index / 6),
    c = chapters[i];
  return (
    '<div class="reading"><section class="letter-sheet"><div class="sheet-head"><i>Letter ' +
    num(i + 1) +
    " / 04</i>" +
    stamp(c.art, "AIR MAIL") +
    '</div><small class="overline">第' +
    ["一", "二", "三", "四"][i] +
    "封来信</small><h1>" +
    c.name +
    '</h1><p class="script">' +
    c.en +
    '</p><div class="hand"><p>见字如面，</p><p>' +
    c.letter +
    '</p><p class="sign">—— 你的旧友</p></div>' +
    button("读这封信", "read") +
    "</section></div>"
  );
}
function quiz() {
  const q = questions[session.index],
    ci = Math.floor(session.index / 6),
    c = chapters[ci];
  return (
    '<div class="quiz-wrap"><aside class="sidebar">' +
    stamp(c.art, "OLD FRIENDS") +
    "<small>LETTER " +
    num(ci + 1) +
    "</small><strong>" +
    c.name +
    "</strong><i>" +
    c.en +
    '</i></aside><section class="question"><div class="q-progress"><span>第' +
    ["一", "二", "三", "四"][ci] +
    "封 · " +
    c.name +
    "</span><b>" +
    num(session.index + 1) +
    " <em>/ " +
    count +
    '</em></b></div><div class="track">' +
    chapters
      .map(
        (_, i) =>
          '<i style="--p:' +
          Math.min(100, Math.max(0, ((session.index + 1 - i * 6) / 6) * 100)) +
          '%"></i>',
      )
      .join("") +
    '</div><div class="q-text"><small class="overline">' +
    q.scene +
    "</small><h1>" +
    q.prompt +
    '</h1></div><div class="options">' +
    q.options
      .map(
        (o) =>
          '<button class="option' +
          (session.answers[session.index] === o.id ? " selected" : "") +
          '" data-answer="' +
          o.id +
          '" aria-pressed="' +
          (session.answers[session.index] === o.id) +
          '"><b>' +
          o.id +
          "</b><span>" +
          o.text +
          "</span></button>",
      )
      .join("") +
    '</div><div class="q-bottom"><button class="link" data-do="prev">← ' +
    (session.index ? "上一题" : "回到信封") +
    "</button><span>进度保存在本机</span></div></section></div>"
  );
}
function reveal() {
  return (
    '<section class="revealing"><div class="envelope">✉</div><p class="salute">Return to sender</p><h1>你的回信到了。</h1>' +
    button("签收明信片", "show") +
    "</section>"
  );
}
function result() {
  const r = classify(session.answers),
    p = r.main,
    firstChoice = r.evidence[0],
    diff = distinguishingAxis(p, r.second);
  return (
    '<article class="result" style="--ink-accent:' +
    p.color +
    '"><section class="result-cover"><div><small class="overline">在《后会友期》里，你最像</small><p class="script">' +
    p.en +
    "</p><h1>" +
    p.name +
    '</h1><div class="reply-note"><small class="overline">你的回信</small><blockquote>' +
    p.reply +
    '</blockquote></div><p class="choice-trace"><b>你在「' +
    firstChoice.q.scene +
    '」选了</b> ' +
    firstChoice.option.text +
    '</p>' +
    button("保存我的明信片", "card") +
    '</div><div class="large-stamp">' +
    stamp(p.art, p.en) +
    postmark +
    '</div></section><div class="result-body"><div class="letter-text"><small class="overline">写给这样的你</small><h2>' +
    p.title +
    '</h2><p>' +
    p.body +
    "</p><h3>朋友收到了什么</h3><p>" +
    p.gift +
    "</p><h3>有时会寄丢什么</h3><p>" +
    p.cost +
    '</p><section class="echo"><small class="overline">节目回声</small><p>' +
    p.echo +
    '</p>' +
    [p.source,p.extraSource].filter(Boolean).map(id => {
      const [label,url]=sources[id];
      return '<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+' ↗</a>';
    }).join(' · ') +
    '</section></div><div class="profile-panel"><h2>你的友情笔迹</h2><p class="muted">五条刻度，记录这次选择的位置。</p>' +
    Object.entries(dimensions)
      .map(
        ([id, d]) =>
          '<div class="scale"><div><b>' +
          d.name +
          "</b><strong>" +
          r.scores[id] +
          '</strong></div><div class="bar"><i style="left:' +
          r.scores[id] +
          '%"></i></div><div><small>' +
          d.low +
          "</small><small>" +
          d.high +
          "</small></div></div>",
      )
      .join("") +
    '<div class="matches"><h3>第二接近 <b>' +
    r.second.name +
    "</b></h3><p>" +
    r.second.line +
    "</p><p>两型在「" +
    diff.name +
    "」上相距最远。你的主型偏向「" +
    diff.main +
    "」，副型偏向「" +
    diff.other +
    "」。</p><h3>最不像 <b>" +
    r.last.name +
    "</b></h3><p>" +
    r.last.line +
    '</p></div></div></div><details class="evidence"><summary>再看一处相似的选择</summary>' +
    r.evidence.slice(1)
      .map((e) => "<p><b>" + e.q.scene + "</b>　" + e.option.text + "</p>")
      .join("") +
    '</details><section class="dispatch" id="dispatch"><div><i class="script">Yours, sincerely.</i><h2>把这张明信片带走</h2><p>可以署上名字，留给自己，也寄给朋友。</p></div><div>' +
    button("保存我的明信片", "card") +
    '<button class="link" data-do="copy">复制分享配文</button><span class="feedback" role="status"></span></div></section><div class="afterword"><button class="link" data-do="edit">回看并修改答卷</button><button class="link" data-do="reset">重新测一次 ↺</button></div></article>'
  );
}
const pages = { home, letter, quiz, reveal, result };
function render(focus = true) {
  clearTimeout(transition);
  busy = false;
  app.innerHTML = pages[session.screen]();
  document.body.dataset.screen = session.screen;
  save(session);
  if (focus) {
    window.scrollTo({ top: 0, behavior: "instant" });
    app.focus({ preventScroll: true });
  }
  if (session.screen === "reveal")
    transition = setTimeout(
      () => go("result"),
      matchMedia("(prefers-reduced-motion:reduce)").matches ? 100 : 2400,
    );
}
function go(screen) {
  session.screen = screen;
  render();
}
let modalVersion = 0;
function modal(html) {
  modalVersion++;
  body.innerHTML = html;
  const heading = body.querySelector("h2");
  if (heading) {
    heading.id = "dialog-title";
    dialog.setAttribute("aria-labelledby", heading.id);
  }
  if (!dialog.open) dialog.showModal();
}
function shareUrl() {
  const u = new URL(location.href);
  if (
    !["http:", "https:"].includes(u.protocol) ||
    ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname)
  )
    return "";
  u.search = "";
  u.hash = "";
  return u.href;
}
function feedback(text) {
  const el = app.querySelector(".feedback");
  if (el) el.textContent = text;
}
function postPreview(p) {
  return (
    '<h2>你的分享明信片</h2><img class="card-image" src="' +
    imageUrl +
    '" alt="' +
    p.name +
    '的友情明信片"><details class="recipient"><summary>修改收件人</summary>' +
    '<form id="recipient-form"><label for="nickname">收件人 <small>选填，仅本机保存</small></label>' +
    '<input id="nickname" name="recipient" maxlength="20" placeholder="久别重逢的我" value="' +
    escape(session.name) +
    '"><button class="link" type="submit">更新明信片</button></form></details><div class="card-controls"><a class="primary" href="' +
    imageUrl +
    '" download="后会友期-' +
    p.name +
    '.png">保存 PNG ↓</a>' +
    (navigator.canShare?.({ files: [shareFile] })
      ? '<button class="link" data-do="share">系统分享 ↗</button>'
      : "") +
    '</div><p class="muted">手机也可以长按明信片保存。</p>'
  );
}
async function showCard() {
  const result = classify(session.answers);
  const p = result.main;
  modal("<h2>正在印制明信片…</h2>");
  clearCard();
  const requested = modalVersion;
  try {
    const blob = await poster(result, session.name, shareUrl());
    if (!dialog.open || requested !== modalVersion) return;
    imageUrl = URL.createObjectURL(blob);
    shareFile = new File([blob], "后会友期-" + p.name + ".png", {
      type: "image/png",
    });
    modal(postPreview(p));
    body.querySelector("a[download]").focus({ preventScroll: true });
  } catch {
    if (dialog.open && requested === modalVersion)
      modal(
        '<h2>明信片暂未生成</h2><p>请再试一次，或复制配文分享。</p><button class="primary" data-do="card">重新生成 ↻</button>',
      );
  }
}
function answer(id) {
  if (busy || session.screen !== "quiz") return;
  busy = true;
  session.answers[session.index] = id;
  save(session);
  app.querySelectorAll("[data-answer]").forEach((el) => {
    el.classList.toggle("selected", el.dataset.answer === id);
    el.setAttribute("aria-pressed", String(el.dataset.answer === id));
  });
  transition = setTimeout(() => {
    if (session.index === count - 1) {
      go("reveal");
      return;
    }
    session.index++;
    go(session.index % 6 === 0 ? "letter" : "quiz");
  }, 230);
}
document.querySelector("#home").onclick = () => go("home");
document.querySelector("#about").onclick = () =>
  modal(
    '<p class="script">About the post office</p><h2>关于旧友邮局</h2><p>《后会友期》把走散的旧友带回同一段旅途。这间小邮局从他们的重逢出发，写了四封信，想问问普通生活里的你会怎样赴约、道歉、留座和告别。</p><p>许飞和厉娜在车上互问近况，白小纯帮青稚把行李搬回来，马天宇也谈起想独处的时刻。同一趟旅行里，靠近有许多种写法。</p><p>24 个选择会与四组同行旧友逐题匹配。结果卡写下你最像的嘉宾，并附上节目的片段出处。你可以返回修改、中途离开，回到这台设备继续。答案与署名仅保存在此浏览器。</p><a href="https://www.mgtv.com/h/914227.html" target="_blank" rel="noopener noreferrer">查看节目 · 芒果 TV ↗</a>',
  );
dialog.querySelector(".close").onclick = () => dialog.close();
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
function clearCard() {
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = "";
  shareFile = null;
}
dialog.addEventListener("close", () => {
  if (!dialog.open) clearCard();
});
dialog.addEventListener("submit", (e) => {
  if (e.target.id !== "recipient-form") return;
  e.preventDefault();
  session.name = e.target.elements.recipient.value.trim();
  save(session);
  showCard();
});
document.addEventListener("click", async (e) => {
  const el = e.target.closest(
    "button[data-do],button[data-answer],button[data-letter]",
  );
  if (!el) return;
  if (el.dataset.answer) {
    answer(el.dataset.answer);
    return;
  }
  if (el.hasAttribute("data-letter")) {
    const i = Number(el.dataset.letter),
      c = chapters[i];
    modal(
      '<div class="peek">' +
        stamp(c.art, "LETTER " + num(i + 1)) +
        '<small class="overline">第' +
        ["一", "二", "三", "四"][i] +
        "封 · 预读</small><h2>" +
        c.name +
        "</h2><p>" +
        c.letter +
        "</p>" +
        button(
          session.answers.length ? "回到我的信件" : "拆开第一封信",
          "start",
        ) +
        "</div>",
    );
    return;
  }
  switch (el.dataset.do) {
    case "start":
      if (dialog.open) dialog.close();
      go(
        session.answers.length === count
          ? "result"
          : session.answers.length
            ? "quiz"
            : "letter",
      );
      break;
    case "read":
      go("quiz");
      break;
    case "prev":
      if (session.index > 0) {
        session.index--;
        go("quiz");
      } else go("letter");
      break;
    case "show":
      go("result");
      break;
    case "card":
      await showCard();
      break;
    case "share":
      try {
        await navigator.share({ files: [shareFile] });
      } catch {
        /* 可继续保存图片。 */
      }
      break;
    case "copy": {
      const p = classify(session.answers).main;
      const msg =
        "我在《后会友期》里最像「" +
        p.name +
        "」：" +
        p.line +
        " 你最像哪位嘉宾？" +
        (shareUrl() ? " " + shareUrl() : "");
      try {
        await navigator.clipboard.writeText(msg);
        feedback("配文已复制");
      } catch {
        modal(
          "<h2>分享配文</h2><textarea readonly>" + escape(msg) + "</textarea>",
        );
        body.querySelector("textarea").select();
      }
      break;
    }
    case "edit":
      session.index = count - 1;
      go("quiz");
      break;
    case "reset":
      modal(
        "<h2>寄出一封新的回信？</h2><p>重新开始会替换本机这次的答卷，可以先保存明信片。</p>" +
          button("重新开始", "confirm-reset"),
      );
      break;
    case "confirm-reset":
      dialog.close();
      session = blank();
      go("letter");
      break;
  }
});
render(false);
