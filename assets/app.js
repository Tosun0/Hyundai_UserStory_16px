/**
 * Hyundai UserStory 16px
 *
 * 16px_Ref 방식:
 *   - 네이티브 스크롤과 CSS 스냅으로 필름↔게임 경계 처리
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

function syncGlobalTitle() {
  const title = document.querySelector("#global-playbook-title");
  title?.classList.add("is-visible");
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

initScrollRouter({ onScroll: renderScroll });
