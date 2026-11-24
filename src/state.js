import { EDITION, questions } from "./content.js";
const key = "old-friends-post:" + EDITION;
const screens = new Set(["home", "letter", "quiz", "reveal", "result"]);
export function blank() {
  return { screen: "home", index: 0, answers: [], name: "" };
}
export function read() {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    if (
      !v ||
      !Array.isArray(v.answers) ||
      v.answers.length > questions.length ||
      !v.answers.every((x, i) => questions[i].options.some((o) => o.id === x))
    )
      return blank();
    if (
      !Number.isInteger(v.index) ||
      v.index < 0 ||
      v.index >= questions.length ||
      v.index > v.answers.length ||
      !screens.has(v.screen)
    )
      return blank();
    if (
      ["reveal", "result"].includes(v.screen) &&
      v.answers.length !== questions.length
    )
      return blank();
    if (v.screen === "letter" && v.index % 6 !== 0) return blank();
    return {
      ...blank(),
      screen: v.screen,
      index: v.index,
      answers: v.answers,
      name: typeof v.name === "string" ? v.name.slice(0, 20) : "",
    };
  } catch {
    return blank();
  }
}
export function save(value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 私密浏览仍可在本页完成。 */
  }
}
