#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  watch,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const draftsDirectory = join(repositoryRoot, "drafts");
const previewRoot = mkdtempSync(join(tmpdir(), "nowledge-mem-drafts-"));
const playgroundAssetsDirectory = join(draftsDirectory, "playground-assets");
const sharedFiles = [
  "custom.css",
  "mem-video-loading.css",
  "mem-video-loading.js",
];
const playgroundAssetFiles = ["playground.css", "playground.js"];
let synchronizedDestinations = new Set();
const watchedFileMtimes = new Map();

function copyRepository() {
  cpSync(repositoryRoot, previewRoot, {
    recursive: true,
    filter(source) {
      const pathInRepository = relative(repositoryRoot, source);
      return pathInRepository !== ".git" && !pathInRepository.startsWith(`.git${sep}`);
    },
  });
}

function draftMappings() {
  const mappings = [];

  for (const entry of readdirSync(draftsDirectory, { withFileTypes: true })) {
    if (entry.name === "README.md" || entry.name === "playground-assets") continue;

    if (entry.name !== "zh") {
      mappings.push({
        source: join(draftsDirectory, entry.name),
        destination: join(previewRoot, entry.name),
        relativeDestination: entry.name,
      });
      continue;
    }

    const zhDraftsDirectory = join(draftsDirectory, "zh");
    if (!existsSync(zhDraftsDirectory)) continue;

    for (const localizedEntry of readdirSync(zhDraftsDirectory, {
      withFileTypes: true,
    })) {
      mappings.push({
        source: join(draftsDirectory, "zh", localizedEntry.name),
        destination: join(previewRoot, "zh", localizedEntry.name),
        relativeDestination: join("zh", localizedEntry.name),
      });
    }
  }

  return mappings;
}

function copyDraft(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function restorePublishedContent(relativeDestination) {
  const previewDestination = join(previewRoot, relativeDestination);
  const publishedSource = join(repositoryRoot, relativeDestination);

  rmSync(previewDestination, { recursive: true, force: true });
  if (existsSync(publishedSource)) {
    mkdirSync(dirname(previewDestination), { recursive: true });
    cpSync(publishedSource, previewDestination, { recursive: true });
  }
}

function syncDrafts() {
  const mappings = draftMappings();
  const currentDestinations = new Set(
    mappings.map(({ relativeDestination }) => relativeDestination),
  );

  for (const destination of synchronizedDestinations) {
    if (!currentDestinations.has(destination)) {
      restorePublishedContent(destination);
    }
  }

  for (const { source, destination } of mappings) {
    copyDraft(source, destination);
  }

  synchronizedDestinations = currentDestinations;
}

function draftPageFiles(directory, relativeDirectory = "") {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const relativePath = join(relativeDirectory, entry.name);
      const absolutePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return draftPageFiles(absolutePath, relativePath);
      }

      return entry.isFile() && entry.name.endsWith(".mdx")
        ? [{ absolutePath, relativePath }]
        : [];
    });
}

function frontmatterField(path, field) {
  const content = readFileSync(path, "utf8");
  const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim().replace(/^['\"]|['\"]$/g, "");
}

function pageIsIndex(page) {
  return page === "index" || page.endsWith("/index");
}

function lessonNumber(page) {
  const sidebarTitle = frontmatterField(page.absolutePath, "sidebarTitle") ?? "";
  const match = sidebarTitle.match(/^(\d+)\./);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function pagesForLanguage(pageFiles, languageCode, languageCodes) {
  const localizedPrefix = languageCode === "en" ? null : `${languageCode}${sep}`;

  return pageFiles
    .filter(({ relativePath }) => {
      if (localizedPrefix) return relativePath.startsWith(localizedPrefix);
      return !languageCodes.some(
        (code) => code !== "en" && relativePath.startsWith(`${code}${sep}`),
      );
    })
    .map(({ absolutePath, relativePath }) => {
      const page = relativePath.replace(/\.mdx$/, "");
      const localPage = localizedPrefix
        ? page.slice(localizedPrefix.length)
        : page;
      const [course = localPage] = localPage.split(sep);

      return { absolutePath, course, localPage, page };
    });
}

function draftTabs(languageCode, languageCodes, pageFiles) {
  const pages = pagesForLanguage(pageFiles, languageCode, languageCodes);
  const courses = new Map();

  for (const page of pages) {
    const entries = courses.get(page.course) ?? [];
    entries.push(page);
    courses.set(page.course, entries);
  }

  return [...courses.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([course, coursePages]) => {
      coursePages.sort((left, right) => {
        const leftIsIndex = pageIsIndex(left.localPage);
        const rightIsIndex = pageIsIndex(right.localPage);
        if (leftIsIndex !== rightIsIndex) return leftIsIndex ? -1 : 1;
        const leftLesson = lessonNumber(left);
        const rightLesson = lessonNumber(right);
        if (leftLesson !== rightLesson) return leftLesson - rightLesson;
        return left.localPage.localeCompare(right.localPage);
      });

      const overview = coursePages.find(({ localPage }) => pageIsIndex(localPage));
      const representative = overview ?? coursePages[0];
      const title = frontmatterField(representative.absolutePath, "title") ?? course;
      const icon = frontmatterField(representative.absolutePath, "icon") ?? "file-text";

      return {
        tab: languageCode === "zh" ? `${title}（草稿）` : `${title} (draft)`,
        icon,
        pages: coursePages.map(({ page }) => page),
      };
    });
}

function writePreviewConfig() {
  const configPath = join(previewRoot, "docs.json");
  const config = JSON.parse(readFileSync(join(repositoryRoot, "docs.json"), "utf8"));
  const pageFiles = draftPageFiles(draftsDirectory);
  const languageCodes = config.navigation.languages.map(({ language }) => language);

  for (const language of config.navigation.languages) {
    language.tabs.push(...draftTabs(language.language, languageCodes, pageFiles));
  }

  const temporaryConfigPath = `${configPath}.draft-preview`;
  writeFileSync(temporaryConfigPath, `${JSON.stringify(config, null, 2)}\n`);
  renameSync(temporaryConfigPath, configPath);
}

function sourceMappingKey(filename) {
  const [first, second] = filename.toString().split(sep);
  if (!first || first === "README.md") return null;
  return first === "zh" ? (second ? join("zh", second) : null) : first;
}

function syncDraftChange(event, filename) {
  const mappingKey = filename && sourceMappingKey(filename);
  if (!mappingKey) {
    syncDrafts();
    writePreviewConfig();
    return;
  }

  const mapping = draftMappings().find(
    ({ relativeDestination }) => relativeDestination === mappingKey,
  );

  if (mapping) {
    copyDraft(mapping.source, mapping.destination);
    synchronizedDestinations.add(mapping.relativeDestination);
  } else if (synchronizedDestinations.has(mappingKey)) {
    restorePublishedContent(mappingKey);
    synchronizedDestinations.delete(mappingKey);
  }

  // Lesson sidebar titles determine the generated order, so any MDX change may
  // affect draft navigation, not only overview-page or rename events.
  if (event === "rename" || filename.toString().endsWith(".mdx")) {
    writePreviewConfig();
  }
}

// Atomic saves briefly remove the path being replaced; retry once after the gap
// instead of crashing on a transient ENOENT or a half-written JSON file.
function withRaceRetry(action) {
  try {
    action();
  } catch (error) {
    const retriable =
      (error && error.code === "ENOENT") || error instanceof SyntaxError;
    if (!retriable) throw error;
    setTimeout(() => {
      try {
        action();
      } catch (retryError) {
        console.warn(`Draft preview sync skipped: ${retryError.message}`);
      }
    }, 100);
  }
}

function syncSharedFile(file) {
  const source = join(repositoryRoot, file);
  const destination = join(previewRoot, file);

  if (!existsSync(source)) {
    rmSync(destination, { force: true });
    return;
  }

  cpSync(source, destination, { force: true });
}

function syncPlaygroundAssets() {
  for (const file of playgroundAssetFiles) {
    const source = join(playgroundAssetsDirectory, file);
    const destination = join(previewRoot, file);

    if (!existsSync(source)) {
      rmSync(destination, { force: true });
      continue;
    }

    cpSync(source, destination, { force: true });
  }
}

function modifiedAt(file) {
  const path = join(repositoryRoot, file);
  return existsSync(path) ? statSync(path).mtimeMs : null;
}

function syncSharedFileIfChanged(file) {
  const nextMtime = modifiedAt(file);
  if (watchedFileMtimes.get(file) === nextMtime) return;
  watchedFileMtimes.set(file, nextMtime);
  syncSharedFile(file);
}

function syncConfigIfChanged() {
  const nextMtime = modifiedAt("docs.json");
  if (watchedFileMtimes.get("docs.json") === nextMtime) return;
  watchedFileMtimes.set("docs.json", nextMtime);
  writePreviewConfig();
}

function syncChangedPath(sourceRoot, destinationRoot, filename) {
  if (!filename) {
    rmSync(destinationRoot, { recursive: true, force: true });
    cpSync(sourceRoot, destinationRoot, { recursive: true });
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
syncDrafts();
syncPlaygroundAssets();
writePreviewConfig();
for (const file of ["docs.json", ...sharedFiles]) {
  watchedFileMtimes.set(file, modifiedAt(file));
}

const watchers = [
  watch(draftsDirectory, { recursive: true }, (event, filename) => {
    withRaceRetry(() => syncDraftChange(event, filename));
  }),
  watch(join(repositoryRoot, "docs.json"), () =>
    withRaceRetry(syncConfigIfChanged),
  ),
];

// The playground-assets directory leaves the repository when the Playground is
// promoted, so only watch it while it exists.
if (existsSync(playgroundAssetsDirectory)) {
  watchers.push(
    watch(playgroundAssetsDirectory, { recursive: true }, () =>
      withRaceRetry(syncPlaygroundAssets),
    ),
  );
}

for (const file of sharedFiles) {
  watchers.push(
    watch(join(repositoryRoot, file), () =>
      withRaceRetry(() => syncSharedFileIfChanged(file)),
    ),
  );
}

const snippetsDirectory = join(repositoryRoot, "snippets");
if (existsSync(snippetsDirectory)) {
  watchers.push(
    watch(snippetsDirectory, { recursive: true }, (_event, filename) => {
      withRaceRetry(() =>
        syncChangedPath(snippetsDirectory, join(previewRoot, "snippets"), filename),
      );
    }),
  );
}

const pageFiles = draftPageFiles(draftsDirectory);
function requestedPreviewPort(args) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const inline = arg.match(/^--port=(\d+)$/) ?? arg.match(/^-p(\d+)$/);
    if (inline) return inline[1];
    if ((arg === "--port" || arg === "-p") && /^\d+$/.test(args[index + 1])) {
      return args[index + 1];
    }
  }

  return "3000";
}

const previewPort = requestedPreviewPort(process.argv.slice(2));
console.log(`\nPreviewing all unpublished drafts from ${previewRoot}`);
console.log("Draft overview routes:");
for (const { absolutePath, relativePath } of pageFiles) {
  if (!relativePath.endsWith(`${sep}index.mdx`) && relativePath !== "index.mdx") {
    continue;
  }

  const route = `/${relativePath.replace(/index\.mdx$/, "").replace(/\\/g, "/")}`;
  console.log(`- ${frontmatterField(absolutePath, "title") ?? route}: http://localhost:${previewPort}${route}`);
}
console.log("Changes under drafts/, snippets/, and shared site assets sync while this command is running.\n");

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
