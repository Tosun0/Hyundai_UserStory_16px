/**
 * Hyundai UserStory 16px
 * 16px_Ref 방식: wheel 이벤트 일절 없음.
 * window.scroll 이벤트로 scrollY를 읽어 UI를 동기화한다.
 */

import { initVhsIntro } from "./modules/vhs-intro.js";
import { initFilmStory } from "./modules/film-story.js";
import { initGameSequence } from "./modules/game-sequence.js";

const TOTAL_CANVAS_SLIDES = 5;

const indicatorEl  = document.querySelector("#scenarioIndicator");
const counterEl    = document.querySelector("#scenarioCounter");
const dots         = [...document.querySelectorAll("#scenarioIndicator .p-dot")];
const canvasSections = [...document.querySelectorAll(".canvas-snap-section")];

// ── 모듈 초기화 (scrollY 기반 update만 사용) ──────────────────────────────
const intro     = initVhsIntro();
const filmStory = initFilmStory();

// 게임 → 시나리오 캔버스 진입: 첫 번째 캔버스 섹션으로 스크롤
const gameSequence = initGameSequence({
  onComplete: () => {
    const first = canvasSections[0];
    if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
  },
});

// ── 인디케이터 렌더 ────────────────────────────────────────────────────────
function renderIndicator(activeIdx) {
  dots.forEach((dot, i) => dot.classList.toggle("active", i === activeIdx));
  if (counterEl) {
    counterEl.textContent =
      `${String(activeIdx + 1).padStart(2, "0")} / ${String(TOTAL_CANVAS_SLIDES).padStart(2, "0")}`;
  }
}

// ── 스크롤 핸들러 (16px_Ref 방식) ─────────────────────────────────────────
function onScroll() {
  const scrollY = window.scrollY;

  // intro + filmStory는 기존 scrollY 기반 업데이트 그대로
  intro.update(scrollY);
  filmStory.update(scrollY);

  // 캔버스 구간 감지: 첫 번째 캔버스 섹션이 뷰포트에 들어오면 phase 전환
  const firstCanvas = canvasSections[0];
  const isCanvas = firstCanvas
    ? scrollY >= firstCanvas.offsetTop - window.innerHeight * 0.4
    : false;

  document.body.dataset.phase = isCanvas ? "scenario-canvas" : "playbook";

  if (isCanvas) {
    let activeIdx = 0;
    canvasSections.forEach((section, i) => {
      if (scrollY >= section.offsetTop - window.innerHeight * 0.4) activeIdx = i;
    });
    renderIndicator(activeIdx);
  } else {
    renderIndicator(0);
  }
}

// ── 16px_Ref 그대로: passive scroll 리스너만 등록 ─────────────────────────
window.addEventListener("scroll", onScroll, { passive: true });

// ── 인디케이터 점 클릭 ─────────────────────────────────────────────────────
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const idx = Number(dot.dataset.index ?? "0");
    canvasSections[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ── 초기화 ─────────────────────────────────────────────────────────────────
onScroll();
