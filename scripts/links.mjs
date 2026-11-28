#!/usr/bin/env node
/**
 * Keeps a link to each song's page on the notations docs site at the top of the song.
 *
 *   node scripts/links.mjs --check   fail if any song's link is missing or doesn't match its path
 *   node scripts/links.mjs --fix     write or update the link in every song
 *
 * The URL comes from the file path, by the same rule as notations' docs/scripts/libraryPages.ts
 * (songUrl). Change both together. notations' library build checks these links against its own
 * URLs when it bumps to a new commit here, so a drift between the two fails there.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = "https://panyam.github.io/notations/";

/** Folders the library leaves out. */
const SKIPPED_DIRS = new Set(["v3", "tests"]);

/** A link line this script wrote, in any version. */
const LINK_LINE = /^\/\/ https:\/\/panyam\.github\.io\/notations\/library\/\S*\n/;

/** Whether a path (relative, with forward slashes) is a song the library shows. */
export function isLibrarySong(p) {
  return p.endsWith(".sng") && !p.split("/").some((part) => SKIPPED_DIRS.has(part));
}

/** A file or folder name in kebab case: `SamiNinneNammi_PanthuVarAli` gives `sami-ninne-nammi-panthu-var-ali`. */
export function kebab(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** The docs site URL for a song: `Thyagaraja/EvvaruRa.sng` gives `.../library/thyagaraja/evvaru-ra/`. */
export function songUrl(p) {
  return `${SITE}library/${p.replace(/\.sng$/, "").split("/").map(kebab).join("/")}/`;
}

/** The song's text with its link line set to `url`, replacing any link line already there. */
export function withLink(text, url) {
  return `// ${url}\n` + text.replace(LINK_LINE, "");
}

/** Every song under `root`, as relative paths with forward slashes, sorted. */
export function songPaths(root, rel = "") {
  return fs
    .readdirSync(path.join(root, rel), { withFileTypes: true })
    .flatMap((e) => {
      if (e.name.startsWith(".") || e.name == "node_modules") return [];
      const p = rel ? `${rel}/${e.name}` : e.name;
      return e.isDirectory() ? songPaths(root, p) : isLibrarySong(p) ? [p] : [];
    })
    .sort();
}

function main(argv) {
  const fix = argv.includes("--fix");
  if (!fix && !argv.includes("--check")) {
    console.error("usage: node scripts/links.mjs --check | --fix");
    return 2;
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const wrong = [];
  for (const p of songPaths(root)) {
    const file = path.join(root, p);
    const text = fs.readFileSync(file, "utf8");
    const want = withLink(text, songUrl(p));
    if (text == want) continue;
    if (fix) fs.writeFileSync(file, want);
    else wrong.push(`${p}: first line should be "// ${songUrl(p)}"`);
  }
  if (wrong.length) {
    console.error(`${wrong.length} song(s) need their link fixed. Run: node scripts/links.mjs --fix\n${wrong.join("\n")}`);
    return 1;
  }
  console.log(fix ? "Links written." : "Every song links to its page.");
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) == fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
