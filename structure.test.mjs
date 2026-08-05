import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { shouldAdvanceToGame } from "./modules/film-story.js";
import { nextGameProgress } from "./modules/game-sequence.js";

const root = dirname(fileURLToPath(import.meta.url));
const html = await readFile(resolve(root, "index.html"), "utf8");
const app = await readFile(resolve(root, "app.js"), "utf8");
const game = await readFile(resolve(root, "Asset/Playbook/_Game/Game.html"), "utf8");
const gameModule = await readFile(resolve(root, "modules/game-sequence.js"), "utf8");
const scenarioModule = await readFile(resolve(root, "modules/scenario-canvas.js"), "utf8");

assert.match(html, /id="sq01"/);
assert.match(html, /id="filmStory"/);
assert.match(html, /id="sq08"/);
assert.match(html, /id="scenarioCanvas"/);
assert.doesNotMatch(`${html}\n${app}`, /_(?:Comp|Img|Footage)\b/);
assert.match(game, /canvas-playbook:scenario-open/);
assert.match(game, /canvas-playbook:game-complete/);
assert.match(game, /canvas-playbook:game-started/);
assert.match(gameModule, /canvas-playbook:game-reset/);
assert.match(gameModule, /type === "canvas-playbook:scenario-open"/);
assert.match(gameModule, /type === "canvas-playbook:game-complete" && root\.classList\.contains\("is-active"\)/);
assert.match(scenarioModule, /onReturnToGame\(\)/);
assert.equal(shouldAdvanceToGame({ sequence: 7, step: 2, direction: 1, locked: false }), true);
assert.equal(shouldAdvanceToGame({ sequence: 7, step: 1, direction: 1, locked: false }), false);
assert.equal(shouldAdvanceToGame({ sequence: 7, step: 2, direction: -1, locked: false }), false);
assert.equal(shouldAdvanceToGame({ sequence: 7, step: 2, direction: 1, locked: true }), false);
assert.equal(nextGameProgress("not-started", "canvas-playbook:game-started"), "playing");
assert.equal(nextGameProgress("playing", "canvas-playbook:game-complete"), "completed");
assert.equal(nextGameProgress("completed", "canvas-playbook:game-reset"), "completed");

const localAssets = [...html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)]
  .map(([, path]) => path)
  .filter((path) => !path.endsWith(".js") && !path.endsWith(".css"));

await Promise.all(localAssets.map((path) => access(resolve(root, path))));

for (const moduleName of ["vhs-intro", "film-story", "game-sequence", "scenario-canvas"]) {
  assert.match(app, new RegExp(`modules/${moduleName}\\.js`));
  await access(resolve(root, "modules", `${moduleName}.js`));
}

console.log(`16px structure OK: ${localAssets.length} local assets`);
