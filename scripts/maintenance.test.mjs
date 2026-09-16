import test from "node:test";
import assert from "node:assert/strict";
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scripts = dirname(fileURLToPath(import.meta.url));
function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "nowledge-maintenance-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}
function write(root, path, text) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}
function run(script, args, options = {}) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8", timeout: 15000, ...options });
}

test("comment check accepts hidden scripts and rejects visible, invalid, or structural edits", (t) => {
  const root = fixture(t);
  const snapshot = join(root, "before.json");
  const checker = join(scripts, "check-mdx-comments.mjs");
  const original = '---\ntitle: Course\ndescription: Test\n---\n\n# Lesson\n\n{/* TODO: video */}\n\n<Check>Saved</Check>\n';
  write(root, "lesson.mdx", original);
  let result = run(checker, ["snapshot", snapshot, root]);
  assert.equal(result.status, 0, result.stderr);
  assert.notEqual(run(checker, ["snapshot", snapshot, root]).status, 0, "baseline must not be overwritten");
  write(root, "lesson.mdx", original.replace("{/* TODO: video */}", "{/*\nVIDEO SCRIPT\n00:00 Action\n旁白：保存记忆。\n*/}"));
  result = run(checker, ["check", snapshot, root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Verified 1 changed/);
  for (const changed of [
    original.replace("Saved", "Not saved"),
    original.replace("{/* TODO: video */}", "{/* missing end"),
    original.replace("<Check>", '<Check title="New visible title">'),
    original.replace("{/* TODO: video */}", '```text\n{/* visible code sample */}\n```'),
  ]) {
    write(root, "lesson.mdx", changed);
    assert.notEqual(run(checker, ["check", snapshot, root]).status, 0, "changed visible/invalid MDX must fail");
  }
  write(root, "lesson.mdx", original);
  write(root, "new.mdx", original);
  assert.notEqual(run(checker, ["check", snapshot, root]).status, 0);
  rmSync(join(root, "new.mdx"));
  rmSync(join(root, "lesson.mdx"));
  assert.notEqual(run(checker, ["check", snapshot, root]).status, 0);
});

function previewFixture(t) {
  const root = fixture(t);
  const repo = join(root, "repo");
  const log = join(root, "calls.jsonl");
  mkdirSync(join(repo, "scripts"), { recursive: true });
  copyFileSync(join(scripts, "preview-drafts.mjs"), join(repo, "scripts/preview-drafts.mjs"));
  const languages = ["en", "zh"].map((language) => {
    const prefix = language === "en" ? "" : "zh/";
    for (const [path, number] of [["ai-workflow/index", null], ["ai-workflow/first", 1]]) {
      write(repo, `${prefix}${path}.mdx`, `---\ntitle: Workflow\nsidebarTitle: ${number ?? "Overview"}. Lesson\n---\nPublished content\n`);
    }
    write(repo, `drafts/${prefix}ai-workflow/second.mdx`, '---\ntitle: Second\nsidebarTitle: 2. Second\n---\nDraft content\n');
    write(repo, `drafts/${prefix}ai-now/index.mdx`, '---\ntitle: AI Now\n---\nDraft overview\n');
    return { language, tabs: [{ tab: "AI Workflow", pages: [`${prefix}ai-workflow/index`, `${prefix}ai-workflow/first`] }] };
  });
  write(repo, "docs.json", JSON.stringify({ navigation: { languages } }));
  write(repo, ".mintignore", "drafts/\n");
  for (const file of ["custom.css", "course-playground-guide.js", "mem-video-loading.css", "mem-video-loading.js", "playground.css", "playground.js", "playground-ai-now.js"]) write(repo, file, "");
  write(root, "bin/mint", `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync('docs.json', 'utf8'));
const present = config.navigation.languages.flatMap(l => l.tabs.flatMap(t => t.pages)).every(p => fs.existsSync(p + '.mdx'));
fs.appendFileSync(process.env.TEST_MINT_LOG, JSON.stringify({ args, cwd: process.cwd(), config, present }) + '\\n');
process.exit(args[0] === process.env.TEST_MINT_FAIL ? 7 : 0);
`);
  chmodSync(join(root, "bin/mint"), 0o755);
  return { repo, root, log, script: join(repo, "scripts/preview-drafts.mjs"), env: { ...process.env, PATH: `${join(root, "bin")}:${process.env.PATH}`, TEST_MINT_LOG: log } };
}

test("draft checks preserve published pages, merge bilingual navigation, and clean up", (t) => {
  const f = previewFixture(t);
  const before = readFileSync(join(f.repo, "docs.json"), "utf8");
  const result = run(f.script, ["--check"], { env: f.env });
  assert.equal(result.status, 0, result.stderr);
  const calls = readFileSync(f.log, "utf8").trim().split("\n").map(JSON.parse);
  assert.deepEqual(calls.map(c => c.args), [["validate"], ["broken-links"], ["a11y"]]);
  assert.ok(calls.every(c => c.present));
  for (const language of calls[0].config.navigation.languages) {
    const prefix = language.language === "en" ? "" : "zh/";
    assert.equal(language.tabs.length, 2, "mixed course must not create a duplicate tab");
    assert.deepEqual(language.tabs[0].pages, ["index", "first", "second"].map(p => `${prefix}ai-workflow/${p}`));
    assert.deepEqual(language.tabs[1].pages, [`${prefix}ai-now/index`]);
  }
  assert.equal(readFileSync(join(f.repo, "docs.json"), "utf8"), before);
  assert.equal(existsSync(calls[0].cwd), false, "temporary preview must be removed");
});

test("draft checks stop on first failure, propagate status, and clean up", (t) => {
  const f = previewFixture(t);
  const result = run(f.script, ["--check"], { env: { ...f.env, TEST_MINT_FAIL: "broken-links" } });
  assert.equal(result.status, 7, result.stderr);
  const calls = readFileSync(f.log, "utf8").trim().split("\n").map(JSON.parse);
  assert.deepEqual(calls.map(c => c.args[0]), ["validate", "broken-links"]);
  assert.equal(existsSync(calls[0].cwd), false);
});

test("selected checks and existing dev arguments retain their behavior", (t) => {
  const f = previewFixture(t);
  let result = run(f.script, ["--check", "a11y"], { env: f.env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(readFileSync(f.log, "utf8").trim()).args[0], "a11y");
  rmSync(f.log);
  result = run(f.script, ["--port", "3018"], { env: f.env });
  assert.equal(result.status, 0, result.stderr);
  const call = JSON.parse(readFileSync(f.log, "utf8").trim());
  assert.deepEqual(call.args, ["dev", "--port", "3018"]);
  assert.equal(existsSync(call.cwd), false);
  assert.equal(run(f.script, ["--check", "deploy"], { env: f.env }).status, 2);
});

test("missing Mintlify reports failure and removes the temporary site", (t) => {
  const f = previewFixture(t);
  const result = run(f.script, ["--check"], { env: { ...f.env, PATH: join(f.root, "missing-bin") } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Cannot run mint validate/);
  const temporary = result.stdout.match(/Checking published pages and merged drafts in (.+)/)?.[1];
  assert.ok(temporary);
  assert.equal(existsSync(resolve(temporary)), false);
});
