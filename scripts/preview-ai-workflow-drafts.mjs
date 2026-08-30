#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  watch,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const previewRoot = mkdtempSync(join(tmpdir(), "nowledge-mem-ai-workflow-"));
const draftSources = [
  {
    source: join(repositoryRoot, "drafts", "ai-workflow"),
    destination: join(previewRoot, "ai-workflow"),
  },
  {
    source: join(repositoryRoot, "drafts", "zh", "ai-workflow"),
    destination: join(previewRoot, "zh", "ai-workflow"),
  },
  {
    source: join(repositoryRoot, "drafts", "ai-now"),
    destination: join(previewRoot, "ai-now"),
  },
  {
    source: join(repositoryRoot, "drafts", "zh", "ai-now"),
    destination: join(previewRoot, "zh", "ai-now"),
  },
];

function copyRepository() {
  cpSync(repositoryRoot, previewRoot, {
    recursive: true,
    filter(source) {
      const pathInRepository = relative(repositoryRoot, source);
      return pathInRepository !== ".git" && !pathInRepository.startsWith(`.git/`);
    },
  });
}

function syncDraft(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
}

function addDraftNavigation() {
  const configPath = join(previewRoot, "docs.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const draftTabs = {
    en: [
      {
        tab: "AI Workflow (draft)",
        icon: "workflow",
        pages: [
          "ai-workflow/index",
          "ai-workflow/create-a-work-brief",
          "ai-workflow/start-with-your-first-ai",
          "ai-workflow/save-a-handoff-checkpoint",
          "ai-workflow/continue-in-another-ai",
          "ai-workflow/close-the-loop",
        ],
      },
      {
        tab: "AI Now (draft)",
        icon: "sparkles",
        pages: [
          "ai-now/index",
          "ai-now/start-a-grounded-task",
          "ai-now/bring-a-source",
          "ai-now/ask-for-an-evidence-brief",
          "ai-now/research-what-is-missing",
          "ai-now/save-the-result",
        ],
      },
    ],
    zh: [
      {
        tab: "AI Workflow（草稿）",
        icon: "workflow",
        pages: [
          "zh/ai-workflow/index",
          "zh/ai-workflow/create-a-work-brief",
          "zh/ai-workflow/start-with-your-first-ai",
          "zh/ai-workflow/save-a-handoff-checkpoint",
          "zh/ai-workflow/continue-in-another-ai",
          "zh/ai-workflow/close-the-loop",
        ],
      },
      {
        tab: "AI Now（草稿）",
        icon: "sparkles",
        pages: [
          "zh/ai-now/index",
          "zh/ai-now/start-a-grounded-task",
          "zh/ai-now/bring-a-source",
          "zh/ai-now/ask-for-an-evidence-brief",
          "zh/ai-now/research-what-is-missing",
          "zh/ai-now/save-the-result",
        ],
      },
    ],
  };

  for (const language of config.navigation.languages) {
    const isChinese = language.language === "zh";
    language.tabs.push(...draftTabs[isChinese ? "zh" : "en"]);
  }

  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

function syncChangedPath(sourceRoot, destinationRoot, filename) {
  if (!filename) {
    syncDraft(sourceRoot, destinationRoot);
    return;
  }

  const sourcePath = join(sourceRoot, filename);
  const destinationPath = join(destinationRoot, filename);

  if (!existsSync(sourcePath)) {
    rmSync(destinationPath, { recursive: true, force: true });
    return;
  }

  if (lstatSync(sourcePath).isDirectory()) {
    rmSync(destinationPath, { recursive: true, force: true });
    cpSync(sourcePath, destinationPath, { recursive: true });
    return;
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(sourcePath, destinationPath, { force: true });
}

copyRepository();
for (const draft of draftSources) {
  syncDraft(draft.source, draft.destination);
}
addDraftNavigation();

const watchers = draftSources.map(({ source, destination }) =>
  watch(source, { recursive: true }, (_event, filename) => {
    syncChangedPath(source, destination, filename);
  }),
);

watchers.push(
  watch(join(repositoryRoot, "custom.css"), () => {
    cpSync(join(repositoryRoot, "custom.css"), join(previewRoot, "custom.css"), {
      force: true,
    });
  }),
);

console.log(`\nPreviewing unpublished course drafts from ${previewRoot}`);
console.log("English: http://localhost:3000/ai-workflow");
console.log("Chinese: http://localhost:3000/zh/ai-workflow");
console.log("AI Now: http://localhost:3000/ai-now");
console.log("AI Now (Chinese): http://localhost:3000/zh/ai-now");
console.log("Changes to drafts and custom.css sync while this command is running.\n");

const mint = spawn("mint", ["dev", ...process.argv.slice(2)], {
  cwd: previewRoot,
  stdio: "inherit",
});

function stopPreview(signal) {
  mint.kill(signal);
}

process.on("SIGINT", () => stopPreview("SIGINT"));
process.on("SIGTERM", () => stopPreview("SIGTERM"));

mint.on("close", (code) => {
  for (const watcher of watchers) watcher.close();
  rmSync(previewRoot, { recursive: true, force: true });
  process.exitCode = code ?? 1;
});
