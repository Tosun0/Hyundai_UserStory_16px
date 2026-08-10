/**
 * Hyundai UserStory 16px
 *
 * 16px_Ref 방식:
 *   - wheel 이벤트는 scroll-router에서 필름↔게임 경계만 처리
 *   - window.scroll (passive) 로 scrollY 읽어 intro/filmStory 업데이트
 *   - scenarioCanvas: fixed 오버레이 유지, 내부 scroll-snap 컨테이너로 슬라이드 전환
 *   - filmStory: 네이티브 스크롤 유지, 마지막 구간만 게임 전환
 */

import { initVhsIntro }      from "./modules/vhs-intro.js";
import { initFilmStory }     from "./modules/film-story.js";
import { initGameSequence }  from "./modules/game-sequence.js";
import { initScenarioCanvas } from "./modules/scenario-canvas.js";
import { initScrollRouter }  from "./modules/scroll-router.js";

const intro          = initVhsIntro();
const filmStory      = initFilmStory();
const scenarioCanvas = initScenarioCanvas({
  onReturnToGame: () => gameSequence?.reset(),
});
let gameSequence;
gameSequence = initGameSequence({
  onComplete: scenarioCanvas.open,
  getReturnScrollY: filmStory.getGameReturnY,
});

function syncGlobalTitle(scrollY = window.scrollY) {
  const playbook = document.querySelector("#playbook");
  const title = document.querySelector("#global-playbook-title");
  title?.classList.toggle("is-visible", !!playbook && scrollY >= playbook.offsetTop);
}

function renderScroll() {
  syncGlobalTitle();
  // 시나리오 캔버스가 열려 있으면 메인 스크롤 업데이트 불필요
  scenarioCanvas.update(window.scrollY);
  if (scenarioCanvas.isOpen()) return;
  const y = window.scrollY;
  intro.update(y);
  filmStory.update(y);
}

function snapSectionBoundary(direction) {
  if (!direction) return;
  const scrollY = window.scrollY;
  const threshold = Math.min(window.innerHeight * 0.65, 520);
  const targets = ["#cover", "#playbook", "#sq08", "#scenario-canvas"]
    .map((selector) => document.querySelector(selector)?.offsetTop)
    .filter((top) => Number.isFinite(top));
  const nextTargets = targets
    .filter((top) => direction > 0 ? top > scrollY : top < scrollY)
    .sort((first, second) => direction > 0 ? first - second : second - first);
  const target = nextTargets[0] ?? null;

  if (target === null || Math.abs(target - scrollY) > threshold) return;
  window.scrollTo({ top: target, behavior: "smooth" });
}

initScrollRouter({ onScroll: renderScroll, onScrollEnd: snapSectionBoundary });
