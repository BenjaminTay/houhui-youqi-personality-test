import { dimensions, profiles, questions } from "./content.js";

const axes = Object.keys(dimensions);
const mean = (numbers) => numbers.reduce((a, b) => a + b, 0) / numbers.length;
export function distances(q, profile) {
  return q.options.map((o) =>
    q.axes.reduce(
      (sum, key, i) =>
        sum + (o.point[i] - profile.coords[axes.indexOf(key)]) ** 2,
      0,
    ),
  );
}
// 每维一个量表档位为带宽。先算绝对接近度，再扣除该人物的题内基线。
// 同一题用公共尺缩放，避免某人四个选项都不贴合仍放大一次偶然优势。
const itemScores = questions.map((q) => {
  const centered = profiles.map((p) => {
    const fit = distances(q, p).map((d) => Math.exp(-d / (2 * q.axes.length)));
    const baseline = mean(fit);
    return fit.map((value) => value - baseline);
  });
  const scale = Math.sqrt(mean(centered.flat().map((value) => value ** 2)));
  return centered.map((row) =>
    row.map((value) => (scale < 1e-9 ? 0 : value / scale)),
  );
});
// 各人物在均匀作答下的全卷方差不同。用全卷而非人物逐题的尺做最后校准，
// 保留其在不贴合的题上较弱的信号；全卷分数的零点和单位可以比较。
const profileScales = profiles.map((_, p) =>
  Math.sqrt(mean(itemScores.flatMap((rows) => rows[p].map((v) => v * v)))),
);
const matrix = itemScores.map((rows) =>
  rows.map((row, p) =>
    row.map((value) =>
      profileScales[p] < 1e-9 ? 0 : value / profileScales[p],
    ),
  ),
);
export function contributions(q, profile) {
  return matrix[questions.indexOf(q)][profiles.indexOf(profile)];
}
export function classify(choices) {
  if (!Array.isArray(choices) || choices.length !== questions.length)
    throw Error("请答完全部题目。");
  const options = questions.map((q, i) => {
    const index = q.options.findIndex((o) => o.id === choices[i]);
    if (index < 0) throw Error("有一道题缺少有效答案。");
    return index;
  });
  const totals = profiles
    .map((profile, p) => ({
      profile,
      p,
      value: options.reduce((sum, o, i) => sum + matrix[i][p][o], 0),
    }))
    .sort((a, b) => b.value - a.value || a.p - b.p);
  const [first, second] = totals;
  const evidence = questions
    .map((q, i) => ({
      q,
      option: q.options[options[i]],
      margin: matrix[i][first.p][options[i]] - matrix[i][second.p][options[i]],
    }))
    .sort((a, b) => b.margin - a.margin);
  const scores = Object.fromEntries(
    axes.map((axis) => {
      let delta = 0,
        up = 0,
        down = 0;
      questions.forEach((q, i) => {
        const d = q.axes.indexOf(axis);
        if (d < 0) return;
        const values = q.options.map((o) => o.point[d]),
          center = mean(values);
        delta += values[options[i]] - center;
        up += Math.max(...values) - center;
        down += center - Math.min(...values);
      });
      return [
        axis,
        Math.round(50 + (50 * delta) / ((delta >= 0 ? up : down) || 1)),
      ];
    }),
  );
  return {
    main: first.profile,
    second: second.profile,
    last: totals.at(-1).profile,
    scores,
    evidence: evidence.slice(0, 2),
    margin: first.value - second.value,
  };
}
export function ideal(profile) {
  return questions.map((q) => {
    const ds = distances(q, profile);
    return q.options[ds.indexOf(Math.min(...ds))].id;
  });
}

// 找到两个原型坐标差异最大的维度，供结果页解释相邻原型。
export function distinguishingAxis(a, b) {
  const gaps = a.coords.map((n, i) => Math.abs(n - b.coords[i]));
  const i = gaps.indexOf(Math.max(...gaps));
  const d = dimensions[axes[i]];
  return {
    name: d.name,
    main: a.coords[i] > b.coords[i] ? d.high : d.low,
    other: a.coords[i] > b.coords[i] ? d.low : d.high,
  };
}
