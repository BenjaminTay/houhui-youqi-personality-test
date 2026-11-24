// 木刻邮票：页面与分享图共用一份可缩放的原画。
const scenes = {
  cup: '<path d="M0 58 38 33l35 25 34-30 53 32v20H0Z" fill="#94a295"/><path d="m0 67 56-14 40 11 64-15v38H0Z" fill="#5d786f"/><path d="M0 72h160v28H0Z" fill="#ab8964"/><ellipse cx="94" cy="85" rx="38" ry="5" fill="#836e54"/><path d="M105 53h11q15 0 8 13-4 8-18 8" fill="none" stroke="#f1d9ab" stroke-width="5"/><path d="m68 51 42 1-4 29q-16 9-33 0Z" fill="#b45d40"/><ellipse cx="89" cy="52" rx="21" ry="4" fill="#ebd1aa"/><ellipse cx="89" cy="52" rx="17" ry="2" fill="#794c37"/><path d="m74 68 10-8 11 9 10-6" stroke="#f0d8ab" stroke-width="2" fill="none"/>',

  signal:
    '<path d="M0 67 36 38l24 20 32-33 40 36 28-20v61H0Z" fill="#536c66"/><path d="M0 74 54 60l45 17 61-19v45H0Z" fill="#263f38"/><g stroke="#f7e7c7" fill="none" stroke-width="1.3"><path d="m0 87 48-13 40 14 72-14M3 94l51-14 45 15 59-12"/></g><g stroke="#302e29" stroke-width="3"><path d="M93 81V29m-10 6h20m-17 7h15m-5-11q32 17 64 11M0 39q46 24 87-3" fill="none"/></g><path d="m85 30 4-3m9 5 3-4" stroke="#302e29" stroke-width="3"/>',
  bridge:
    '<path d="M0 56 32 35l29 17 25-25 47 33 27-12v31H0Z" fill="#9eaa89"/><path d="M0 72q38-9 86-4t74-6v40H0Z" fill="#77999b"/><path d="M0 61q24 2 46-7l80-6 34-8v8l-33 9-81 6L0 70Z" fill="#394c42"/><path d="m41 58-4 29m44-33-1 28m43-33 4 25" stroke="#445446" stroke-width="5"/><path d="m0 57 47-8 79-6 34-9m-137 23v6m26-11v7m23-10v7m23-9v7m24-9v7m21-13v7" fill="none" stroke="#394c42" stroke-width="1.5"/><path d="m4 90 28-3m19 7 30-2m12-2 28-4m3 11 27-3" stroke="#e7d8b8" fill="none"/>',
  lantern:
    '<path d="M0 67 28 42l30 21 51-32 51 32v38H0Z" fill="#88868a"/><path d="M0 71 47 52l41 21 37-17 35 10v35H0Z" fill="#4b5658"/><path d="M0 85 45 75l33 4 47-10 35 10v23H0Z" fill="#303e40"/><g stroke="#392f26" stroke-width="3"><path d="M87 76V36h14M95 37v7"/><path d="m89 47 5-5 6 5-1 13h-9Z" fill="#f4c474"/></g><path d="m81 48-6-2m30-1 5-2m-27 14-6 3m29-5 5 2" stroke="#ffe2a5" fill="none"/>',
  boat: '<path d="M0 53 34 35l37 21 38-28 51 27v30H0Z" fill="#7b988d"/><path d="M0 68 48 50l27 12 51-14 34 10v20H0Z" fill="#476b6b"/><path d="M0 70q55-7 91 0t69-3v35H0Z" fill="#90ac9d"/><path d="m60 79 20-31v30Z" fill="#f3e5bd"/><path d="M83 51v27h14Z" fill="#c17a50"/><path d="m55 80 46-1-8 7H64Z" fill="#314746"/><path d="m12 78 25-2m-29 14 35-3m59 6 39-3m-80 5h26m29-15 24-2" fill="none" stroke="#536d69"/>',
  mountain:
    '<path d="M0 73 37 42l22 15 35-42 66 60v28H0Z" fill="#687f7b"/><path d="m64 54 30-39 36 35-21-10-9 4-5-13-13 21 1-10Z" fill="#f1e2bd"/><path d="m0 83 47-25 32 17 42-21 39 14v34H0Z" fill="#3c5b53"/><path d="M5 91 46 68m-33 27 38-20m56-9 16-7m-9 13 15-7" stroke="#b7b99b" fill="none"/>',
  tent: '<path d="M0 63 27 41l28 17 39-27 36 27 30-12v55H0Z" fill="#86977a"/><path d="M0 76q28-12 57-10t103-6v41H0Z" fill="#536a4a"/><path d="m43 84 28-36 43 7 19 26-51 5Z" fill="#d89c68"/><path d="m43 84 28-36 13 38Z" fill="#b46a44"/><path d="m58 83 12-23 8 24Z" fill="#433d34"/><path d="m72 49 12 37 46-5m-86 4-10 5m91-7 11 4" fill="none" stroke="#624b35"/>',
  island:
    '<path d="M0 58q47-9 85 0t75-2v46H0Z" fill="#93a99d"/><path d="m0 72 22-5 20 7 23-4 22 3 28-13 45 4v6l-52-2-27 9-48-2-33 3Z" fill="#72847a"/><path d="m39 85 37-9 16-15 12 15 21 7Z" fill="#425c54"/><path d="m83 71 5-26 4-7 3 31m-13-13 8-13 8 11m-18 9 11-14 9 12" stroke="#45594d" stroke-width="3" fill="none"/><path d="m13 92 31-2m59 3 37-4" stroke="#546f69"/>',
};
const skies = {
  cup: "#ead0a6",
  signal: "#eac395",
  bridge: "#ddd4ad",
  lantern: "#d4b0a3",
  boat: "#efd2a0",
  mountain: "#ddc299",
  tent: "#e5cba3",
  island: "#e6d6b3",
};
export function landscape(kind) {
  let lines = "";
  for (let y = 4; y < 100; y += 3.3) lines += '<path d="M0 ' + y + 'h160"/>';
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" aria-hidden="true"><rect width="160" height="100" fill="' +
    skies[kind] +
    '"/><circle cx="45" cy="28" r="12" fill="#f7e7bf"/>' +
    scenes[kind] +
    '<g fill="none" stroke="#574a36" stroke-width=".65" opacity=".19">' +
    lines +
    '</g><path d="m118 21 4 2 4-4m4 4 3 2 4-3" stroke="#55635a" fill="none"/></svg>'
  );
}
export function stamp(kind, caption) {
  return (
    '<div class="stamp" aria-hidden="true"><div>' +
    landscape(kind) +
    "<span>" +
    caption +
    "<b>POST</b></span></div></div>"
  );
}
export const postmark =
  '<svg class="postmark" viewBox="0 0 156 82" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.6"><circle cx="42" cy="41" r="35"/><circle cx="42" cy="41" r="30"/><path d="M15 33h54M14 48h55"/><path d="M70 29c20-16 32 12 53-2s29-5 33-5m-86 15c20-16 32 12 53-2s29-5 33-5m-86 15c20-16 32 12 53-2s29-5 33-5m-86 15c20-16 32 12 53-2s29-5 33-5"/></g><g fill="currentColor" font-family="serif" text-anchor="middle"><text x="42" y="28" font-size="9">旧友邮局</text><text x="42" y="44" font-size="10">AIR MAIL</text><text x="42" y="59" font-size="7">POST PAID</text></g></svg>';
