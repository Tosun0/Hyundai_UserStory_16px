import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const html = await readFile(resolve(root, "index.html"), "utf8");
const app = await readFile(resolve(root, "app.js"), "utf8");

assert.match(html, /id="sq01"/);
assert.match(html, /id="filmStory"/);
assert.match(html, /id="sq08"/);
assert.match(html, /id="scenarioCanvas"/);
assert.doesNotMatch(`${html}\n${app}`, /_(?:Comp|Img|Footage)\b/);

const localAssets = [...html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)]
  .map(([, path]) => path)
  .filter((path) => !path.endsWith(".js") && !path.endsWith(".css"));

await Promise.all(localAssets.map((path) => access(resolve(root, path))));

for (const moduleName of ["vhs-intro", "film-story", "game-sequence", "scenario-canvas"]) {
  assert.match(app, new RegExp(`modules/${moduleName}\\.js`));
  await access(resolve(root, "modules", `${moduleName}.js`));
}

console.log(`16px structure OK: ${localAssets.length} local assets`);
