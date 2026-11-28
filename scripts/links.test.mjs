import { test } from "node:test";
import assert from "node:assert/strict";
import { isLibrarySong, kebab, songUrl, withLink, SITE } from "./links.mjs";

// The same cases as notations' docs/tests/library.spec.ts, so the two slug rules stay in step.
test("URLs come from the file path, in kebab case", () => {
  assert.equal(songUrl("Thyagaraja/EvvaruRa.sng"), SITE + "library/thyagaraja/evvaru-ra/");
  assert.equal(songUrl("Varnams/SamiNinneNammi_PanthuVarAli.sng"), SITE + "library/varnams/sami-ninne-nammi-panthu-var-ali/");
  assert.equal(songUrl("Geethams/Ana Lekara.sng"), SITE + "library/geethams/ana-lekara/");
  assert.equal(songUrl("ShyamaShastri/1/SKDAmbaPahi.sng"), SITE + "library/shyama-shastri/1/skd-amba-pahi/");
  assert.equal(kebab("Rā"), "ra");
});

test("v3 and tests folders, and files other than .sng, are left out", () => {
  assert.deepEqual(
    ["Varnams/v3/Sharana.sng", "tests/a.sng", "README.md", "Varnams/Viriboni.sng"].filter(isLibrarySong),
    ["Varnams/Viriboni.sng"],
  );
});

test("the link goes on the first line, above the front matter", () => {
  const url = songUrl("Thyagaraja/EvvaruRa.sng");
  assert.equal(withLink('---\nRagam: "Mohanam"\n---\nS R', url), `// ${url}\n---\nRagam: "Mohanam"\n---\nS R`);
});

test("an old link is replaced, so a renamed file gets its new URL", () => {
  const old = `// ${SITE}library/thyagaraja/old-name/\n---\nRagam: "Mohanam"\n---\n`;
  const url = songUrl("Thyagaraja/EvvaruRa.sng");
  assert.equal(withLink(old, url), `// ${url}\n---\nRagam: "Mohanam"\n---\n`);
  assert.equal(withLink(withLink(old, url), url), withLink(old, url));
});

test("other comments at the top are kept", () => {
  const url = songUrl("Thyagaraja/EvvaruRa.sng");
  assert.equal(withLink("// from my notebook\nS R", url), `// ${url}\n// from my notebook\nS R`);
});
