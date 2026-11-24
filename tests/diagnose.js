import assert from "node:assert/strict";
import { profiles, questions } from "../src/content.js";
import { classify, ideal } from "../src/scoring.js";
let state = 20261124;
function option() {
  state = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return "ABCD"[Math.floor(state / 2 ** 30)];
}
const counts = Object.fromEntries(profiles.map((p) => [p.id, 0]));
for (let i = 0; i < 20000; i++)
  counts[classify(questions.map(option)).main.id]++;
for (const p of profiles) {
  const actual = classify(ideal(p));
  assert.equal(actual.main.id, p.id);
  assert.ok(counts[p.id] > 0);
  console.log(
    p.name,
    "自洽分差",
    actual.margin.toFixed(2),
    "随机作答",
    counts[p.id] + "/20000",
  );
}

for(const p of profiles){
  const answers=ideal(p);
  let retained=0;
  let changed=0;
  for(const [i,q] of questions.entries()){
    for(const option of q.options){
      if(option.id===answers[i])continue;
      const alternate=[...answers];alternate[i]=option.id;
      if(classify(alternate).main.id===p.id)retained++;else changed++;
    }
  }
  console.log(p.name,"理论路径单题改选后保持主型",retained+"/"+(retained+changed));
}
