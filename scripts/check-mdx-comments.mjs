#!/usr/bin/env node

import { readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { delimiter, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [mode, snapshotPath, rootArgument, ...extra] = process.argv.slice(2);
if (!["snapshot", "check"].includes(mode) || !snapshotPath || extra.length) {
  console.error("Usage: node scripts/check-mdx-comments.mjs <snapshot|check> <snapshot.json> [repository-root]");
  process.exit(2);
}
const root = resolve(rootArgument ?? ".");
const skipped = new Set([".git", ".agents", ".codex", ".omo", "node_modules"]);

function readPages(directory, prefix = "") {
  const pages = {};
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const relativePath = prefix + entry.name;
    if (entry.isDirectory()) {
      Object.assign(pages, readPages(join(directory, entry.name), relativePath + "/"));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      pages[relativePath] = readFileSync(join(directory, entry.name), "utf8");
    }
  }
  return pages;
}

async function mdxParser() {
  const requireHere = createRequire(import.meta.url);
  const candidates = [() => requireHere.resolve("@mdx-js/mdx")];
  // Mintlify already supplies MDX. Locate it through the installed CLI without
  // relying on a developer-specific global node_modules path or installing it.
  for (const directory of (process.env.PATH ?? "").split(delimiter)) {
    candidates.push(() => {
      const mintPath = realpathSync(join(directory, "mint"));
      return createRequire(mintPath).resolve("@mdx-js/mdx");
    });
  }
  for (const locate of candidates) {
    let modulePath;
    try { modulePath = locate(); } catch { continue; }
    const { createProcessor } = await import(pathToFileURL(modulePath).href);
    return createProcessor({ format: "mdx" });
  }
  throw new Error("MDX parser unavailable. Use an existing Mintlify CLI installation; no packages were installed.");
}

function renderedStructure(value) {
  if (Array.isArray(value)) return value.map(renderedStructure).filter((node) => node !== null);
  if (!value || typeof value !== "object") return value;
  if (["mdxFlowExpression", "mdxTextExpression"].includes(value.type) && value.data?.estree?.body?.length === 0) {
    return null; // Valid empty/comment-only MDX expressions have no output.
  }
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !["position", "data"].includes(key))
    .map(([key, item]) => [key, renderedStructure(item)]));
}

try {
  const pages = readPages(root);
  if (mode === "snapshot") {
    writeFileSync(snapshotPath, JSON.stringify({ version: 1, pages }, null, 2) + "\n", { flag: "wx" });
    console.log(`Saved ${Object.keys(pages).length} MDX pages to ${snapshotPath}`);
  } else {
    const before = JSON.parse(readFileSync(snapshotPath, "utf8"));
    if (before.version !== 1 || !before.pages || Array.isArray(before.pages) || typeof before.pages !== "object" || Object.values(before.pages).some((text) => typeof text !== "string")) {
      throw new Error("Not a valid MDX comment-check snapshot.");
    }
    const names = Object.keys(pages).sort();
    if (JSON.stringify(names) !== JSON.stringify(Object.keys(before.pages).sort())) {
      throw new Error("MDX pages were added or deleted; this is not a comment-only change.");
    }
    const changed = names.filter((name) => pages[name] !== before.pages[name]);
    if (changed.length) {
      const processor = await mdxParser();
      for (const name of changed) {
        try {
          const oldTree = renderedStructure(processor.parse(before.pages[name]));
          const newTree = renderedStructure(processor.parse(pages[name]));
          if (JSON.stringify(oldTree) !== JSON.stringify(newTree)) throw new Error("rendered MDX structure changed");
        } catch (error) {
          throw new Error(`${name}: ${error.message}`);
        }
      }
    }
    console.log(`Verified ${changed.length} changed MDX pages: rendered structure unchanged.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
