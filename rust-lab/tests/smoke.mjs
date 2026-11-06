import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script, runInNewContext } from "node:vm";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const html = read("../index.html");
const css = read("../style.css");
const script = read("../app.js");
const lessonsText = read("../lessons.js");

new Script(script, { filename: "app.js" });
new Script(lessonsText, { filename: "lessons.js" });
const context = { window: {} };
runInNewContext(lessonsText, context);
const data = context.window.RUST_LAB_COURSE;
assert.ok(data, "course data not loaded");
assert.equal(data.groups.length, 5);
assert.equal(data.lessons.length, 31);
assert.match(data.commit, /^[a-f0-9]{40}$/);
assert.equal(new Set(data.lessons.map(x => x.id)).size, data.lessons.length);

for (const lesson of data.lessons) {
  assert.ok(data.groups.find(g => g.id === lesson.group), lesson.id + ": group");
  assert.ok(lesson.title && lesson.lead && lesson.java && lesson.rust, lesson.id + ": missing explanation");
  assert.ok(lesson.source.path.startsWith("src/") || lesson.source.path === "Cargo.toml", lesson.id + ": source");
  assert.ok(lesson.source.start > 0 && lesson.source.end >= lesson.source.start, lesson.id + ": source lines");
  assert.ok(lesson.quiz.options.length === 4, lesson.id + ": quiz option count");
  assert.ok(lesson.quiz.correct >= 0 && lesson.quiz.correct < 4, lesson.id + ": quiz answer");
  assert.ok(lesson.task.rules.length, lesson.id + ": missing checks");
  assert.notEqual(lesson.task.starter, lesson.task.answer, lesson.id + ": starter should require work");
  for (const rule of lesson.task.rules) {
    assert.match(lesson.task.answer, new RegExp(rule.pattern, "m"), lesson.id + ": solution does not pass " + rule.label);
  }
}
const paths = new Set(data.files.map(x => x[0]));
for (const lesson of data.lessons) {
  assert.ok(paths.has(lesson.source.path), lesson.id + ": source path absent from explorer");
}
assert.match(html, /<script src="\.\/lessons\.js"><\/script>/);
assert.match(html, /<script src="\.\/app\.js"><\/script>/);
assert.match(html, /id="main"/);
assert.match(html, /id="course-outline"/);
assert.match(html, /id="mobile-scrim"/);
assert.match(script, /play\.rust-lang\.org/);
assert.match(script, /sourceFocus/);
assert.match(css, /@media\(max-width:680px\)/);
console.log("Rust Learning Lab smoke passed:", data.lessons.length, "lessons,", data.files.length, "source files.");
