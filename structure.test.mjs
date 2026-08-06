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
const filmModule = await readFile(resolve(root, "modules/film-story.js"), "utf8");
const scrollRouter = await readFile(resolve(root, "modules/scroll-router.js"), "utf8");
const style = await readFile(resolve(root, "style.css"), "utf8");

assert.match(html, /id="sq01"/);
assert.match(html, /id="filmStory"/);
assert.match(html, /id="sq08"/);
assert.match(html, /id="gameSkipButton"[^>]*>게임 건너뛰기<\/button>/);
assert.match(html, /id="scenarioCanvas"/);
assert.match(app, /initScrollRouter\(\{ onScroll: renderScroll \}\)/);
assert.doesNotMatch(`${app}\n${filmModule}\n${scenarioModule}`, /window\.addEventListener\("(?:scroll|wheel|touchstart|touchend)"/);
assert.match(scrollRouter, /window\.addEventListener\("scroll", onScroll, \{ passive: true \}\)/);
assert.doesNotMatch(scrollRouter, /addEventListener\("wheel"/);
assert.doesNotMatch(app, /frameRequested|requestAnimationFrame\(renderScroll\)/);
assert.match(html, /핸들을 놓기엔, 내 인생은 아직 주행 중/);
assert.match(html, /고령 운전자의 하루, <span>원점으로<\/span> 돌아오다\./);
assert.match(html, /data-sequence="3" data-steps="2"/);
assert.match(html, /data-sequence="7" data-steps="1"/);
assert.match(html, /T_PhoneCall_02\.png/);
assert.doesNotMatch(html, /T_PhoneCall_01\.png/);
assert.doesNotMatch(html, /T_Schedule_01\.png/);
assert.match(html, /history\.scrollRestoration = "manual"/);
assert.match(html, /event\.persisted/);
assert.doesNotMatch(html, /scenario-header|scenarioBackButton/);
assert.match(scenarioModule, /#rewindBtn/);
assert.match(style, /scenario-header-arrive/);
assert.match(style, /scenario-canvas-stage:not\(\.active\) \.canvas-slide img/);
assert.doesNotMatch(`${game}\n${scenarioModule}`, /deltaY.*(?:12|32)/);
assert.match(style, /\.scroll-prompt[\s\S]*background: transparent/);
assert.doesNotMatch(`${html}\n${app}`, /_(?:Comp|Img|Footage)\b/);
assert.match(game, /canvas-playbook:scenario-open/);
assert.match(game, /canvas-playbook:game-complete/);
assert.match(game, /canvas-playbook:game-started/);
assert.match(gameModule, /canvas-playbook:game-reset/);
assert.match(gameModule, /type === "canvas-playbook:scenario-open"/);
assert.match(gameModule, /type === "canvas-playbook:game-complete" && root\.classList\.contains\("is-active"\)/);
assert.match(scenarioModule, /onReturnToGame\(\)/);
assert.match(filmModule, /windowElement\.dataset\.activeStep = String\(step\)/);
assert.match(filmModule, /const visibleStep = Number\(windowElement\.dataset\.activeStep \|\| 0\)/);
assert.doesNotMatch(filmModule, /isCurrent && index === step/);
assert.match(filmModule, /document\.documentElement\.classList\.contains\("scenario-open"\)/);
assert.match(scenarioModule, /e\.target !== root/);
assert.match(scenarioModule, /clearTimeout\(inertiaFlushTimer\)/);
assert.match(scenarioModule, /setTimeout\(\(\) => \{ peakDelta = 0; \}, 80\)/);
assert.equal(shouldAdvanceToGame({ sequence: 7, step: 2, direction: 1, locked: false }), true);
assert.equal(shouldAdvanceToGame({ sequence: 7, step: 0, stepCount: 1, direction: 1, locked: false }), true);
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

for (const moduleName of ["vhs-intro", "film-story", "game-sequence", "scenario-canvas", "scroll-router"]) {
  assert.match(app, new RegExp(`modules/${moduleName}\\.js`));
  await access(resolve(root, "modules", `${moduleName}.js`));
}

console.log(`16px structure OK: ${localAssets.length} local assets`);
