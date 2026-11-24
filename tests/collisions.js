// 运行 node tests/collisions.js，使用生产分类器和同一组随机数对比题库版本。
import { EDITION, questions, profiles } from "../src/content.js";
import { classify, contributions, distances, ideal } from "../src/scoring.js";

import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// 传入旧版本目录，按旧题生成答卷，让新旧两个正式分类器读取同一数组。
const baselineDir = process.argv[2];
const loadBaseline = (name) =>
  import(pathToFileURL(resolve(baselineDir, "src", name)).href);
const source = baselineDir
  ? await loadBaseline("content.js")
  : { EDITION, questions, profiles };
const model = baselineDir ? await loadBaseline("scoring.js") : { distances };
const ids = (qs) => qs.map((q) => [q.id, q.options.map((o) => o.id)]);
assert.deepEqual(ids(source.questions), ids(questions));
assert.deepEqual(
  source.profiles.map((p) => [p.id, p.name]),
  profiles.map((p) => [p.id, p.name]),
);

const seed = 20261124;
function generator() {
  let state = seed;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
const zeros = () => Object.fromEntries(profiles.map((p) => [p.name, 0]));
const presence = zeros(),
  slots = zeros(),
  items = {};
for (const q of questions) {
  const rows = profiles.map((p) => contributions(q, p));
  const winners = q.options.map((_, i) => {
    const peak = Math.max(...rows.map((row) => row[i]));
    return profiles
      .filter((p, j) => peak - rows[j][i] < 1e-9)
      .map((p) => p.name);
  });
  for (const name of new Set(winners.flat())) presence[name]++;
  for (const names of winners) if (names.length === 1) slots[names[0]]++;
  items[q.id] = winners;
}
const random = generator(),
  pairs = {},
  primary = zeros();
const paired = baselineDir
  ? {
      sourceEdition: source.EDITION,
      uniformMainChanged: 0,
      baselinePairs: {},
      probes: {},
    }
  : null;
function recordPair(table, { main, second, margin }) {
  const key = [main.name, second.name].sort().join("／");
  const row = (table[key] ??= { top2: 0, near: 0 });
  row.top2++;
  if (margin < 1) row.near++;
}
const sampleCount = 100000;
for (let i = 0; i < sampleCount; i++) {
  const answers = questions.map(
    (q) => q.options[Math.floor(random() * q.options.length)].id,
  );
  const result = classify(answers);
  primary[result.main.name]++;
  recordPair(pairs, result);
  if (paired) {
    const previous = model.classify(answers);
    recordPair(paired.baselinePairs, previous);
    paired.uniformMainChanged += Number(result.main.id !== previous.main.id);
  }
}
const probeCount = 5000,
  guests = {};
for (const p of profiles) {
  const rng = generator();
  const origin = source.profiles.find((old) => old.id === p.id);
  const best = source.questions.map((q) => {
    const ds = model.distances(q, origin);
    return q.options.filter((_, i) => ds[i] === Math.min(...ds));
  });
  const predicted = zeros();
  const oldPredictions = paired && zeros();
  let changed = 0;
  for (let i = 0; i < probeCount; i++) {
    const answers = questions.map((q, j) => {
      const pick = rng(),
        noise = rng(),
        any = rng();
      return noise < 0.25
        ? q.options[Math.floor(any * q.options.length)].id
        : best[j][Math.floor(pick * best[j].length)].id;
    });
    const main = classify(answers).main;
    predicted[main.name]++;
    if (paired) {
      const prev = model.classify(answers).main;
      oldPredictions[prev.name]++;
      changed += Number(prev.id !== main.id);
    }
  }
  if (paired) paired.probes[p.name] = { baseline: oldPredictions, changed };
  const path = ideal(p),
    self = classify(path);
  let retained = 0;
  for (const [i, q] of questions.entries())
    for (const o of q.options) {
      if (o.id === path[i]) continue;
      const changed = [...path];
      changed[i] = o.id;
      retained += Number(classify(changed).main === p);
    }
  guests[p.name] = {
    self: self.main.name,
    runner: self.second.name,
    margin: +self.margin.toFixed(2),
    retained,
    predicted,
  };
}
console.log(
  JSON.stringify(
    {
      edition: EDITION,
      seed,
      sampleCount,
      probeCount,
      primary,
      pairs,
      guests,
      items,
      presence,
      slots,
      ...(paired && { paired }),
    },
    null,
    2,
  ),
);
