import { test } from "node:test";
import assert from "node:assert/strict";
import { profiles, questions, dimensions, sources } from "../src/content.js";
import { classify, contributions, ideal } from "../src/scoring.js";
test("四幕与选项完整，坐标合法，所有维度重复覆盖", () => {
  assert.equal(questions.length, 24);
  assert.equal(new Set(questions.map((q) => q.id)).size, 24);
  for (const q of questions) {
    assert.ok([2, 3].includes(q.axes.length));
    assert.equal(new Set(q.axes).size, q.axes.length);
    assert.ok(q.axes.every((id) => id in dimensions));
    assert.deepEqual(
      q.options.map((o) => o.id),
      ["A", "B", "C", "D"],
    );
    for (const o of q.options)
      assert.ok(
        o.point.length === q.axes.length &&
          o.point.every((v) => Number.isInteger(v) && v >= 1 && v <= 5),
      );
  }
  for (const id of Object.keys(dimensions))
    assert.ok(questions.filter((q) => q.axes.includes(id)).length >= 8);
});
test("每种原型回到自身，展示分有界，证据来自实选，排序可复现", () => {
  for (const p of profiles) {
    assert.ok(sources[p.source]);
    const answers = ideal(p),
      r = classify(answers);
    assert.equal(r.main.id, p.id);
    assert.equal(new Set([r.main, r.second, r.last]).size, 3);
    assert.ok(r.margin > 1);
    assert.ok(Object.values(r.scores).every((n) => n >= 0 && n <= 100));
    for (const e of r.evidence)
      assert.equal(e.option.id, answers[questions.indexOf(e.q)]);
    assert.deepEqual(classify(answers), r);
  }
});
test("拒绝无效、空洞和不完整答卷", () => {
  for (const answers of [
    null,
    [],
    new Array(24),
    Array(24).fill("E"),
    Array(25).fill("A"),
  ])
    assert.throws(() => classify(answers));
});

test("八位同行嘉宾各有成品卡与素材出处", () => {
  const guests = [
    "张萌",
    "马天宇",
    "许飞",
    "厉娜",
    "文吉儿",
    "王子璇",
    "青稚",
    "白小纯",
  ];
  assert.deepEqual(profiles.map((p) => p.name).sort(), guests.sort());
  assert.equal(new Set(profiles.map((p) => p.id)).size, 8);
  assert.equal(new Set(profiles.map((p) => p.art)).size, 8);
  for (const p of profiles) {
    assert.equal(p.coords.length, Object.keys(dimensions).length);
    assert.ok(p.coords.every((v) => Number.isInteger(v) && v >= 1 && v <= 5));
    assert.ok(p.echo.includes(p.name));
    for (const id of [p.source, p.extraSource].filter(Boolean))
      assert.ok(sources[id][1].startsWith("https://"));
  }
});

test("有明确素材指向的对照选项，与正式分类器的单项贡献一致", () => {
  const anchors = [
    ["q04", "B", "厉娜"],
    ["q05", "B", "文吉儿"],
    ["q06", "B", "张萌"],
    ["q06", "D", "白小纯"],
    ["q08", "A", "马天宇"],
    ["q12", "D", "白小纯"],
    ["q13", "A", "文吉儿"],
    ["q13", "C", "许飞"],
    ["q14", "B", "王子璇"],
    ["q16", "C", "许飞"],
    ["q18", "C", "白小纯"],
    ["q19", "C", "王子璇"],
    ["q20", "A", "张萌"],
    ["q20", "B", "文吉儿"],
    ["q20", "C", "青稚"],
    ["q20", "D", "马天宇"],
    ["q21", "A", "张萌"],
    ["q21", "B", "青稚"],
  ];
  for (const [id, letter, name] of anchors) {
    const q = questions.find((q) => q.id === id);
    const index = q.options.findIndex((o) => o.id === letter);
    const values = profiles.map((p) => contributions(q, p)[index]);
    assert.deepEqual(
      profiles
        .filter((_, i) => Math.max(...values) - values[i] < 1e-9)
        .map((p) => p.name),
      [name],
      id + letter,
    );
  }
});
test("第十九题把定下交往距离和暂缓决定区分开", () => {
  const q = questions.find(q => q.id === "q19");
  const li = contributions(q, profiles.find(p => p.name === "厉娜"));
  const wang = contributions(q, profiles.find(p => p.name === "王子璇"));
  const decided = q.options.findIndex(o => o.id === "C");
  const pending = q.options.findIndex(o => o.id === "D");
  assert.ok(wang[decided] > li[decided]);
  assert.ok(li[pending] > wang[pending]);
});
test("均匀作答的每型题内均值为零，全卷采用相同方差标尺", () => {
  for (const p of profiles) {
    const rows = questions.map((q) => contributions(q, p));
    for (const row of rows)
      assert.ok(Math.abs(row.reduce((a, b) => a + b, 0)) < 1e-9);
    const entries = rows.flat();
    assert.ok(
      Math.abs(
        entries.reduce((sum, v) => sum + v * v, 0) / entries.length - 1,
      ) < 1e-9,
    );
  }
});

test("按节目动作写成的八份混合作答，各自落回对应嘉宾", () => {
  // 每组依答题顺序记录一幕六题。固定作答不调用 ideal，允许出现与主型不一致的选择。
  const cases = [
    ["张萌", "AAADCB ADBABD BBDBBC ACAAAC"],
    ["马天宇", "BCBBCA DADCAD DCDDDA DDDDBD"],
    ["许飞", "CACABC CCACCA CCACCB BACACC"],
    ["厉娜", "DDBBBD BDBBDD ACBAAC CDDCCD"],
    ["文吉儿", "CBCABC BCCCCA ACACAB BADBCA"],
    ["王子璇", "BBDBDD DBDBDB DBBDAD CBCCDB"],
    ["青稚", "DDADAB CACACA BBCBCB ACBBAA"],
    ["白小纯", "BAABCD ADABBD DDCAAC DCCDAB"],
  ];
  for (const [name, path] of cases) {
    const answers = [...path.replaceAll(" ", "")];
    assert.equal(classify(answers).main.name, name);
    assert.notDeepEqual(answers, ideal(profiles.find((p) => p.name === name)));
  }
});
