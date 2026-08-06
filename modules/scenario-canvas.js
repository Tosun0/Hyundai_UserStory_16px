/**
 * scenario-canvas.js (16px)
 *
 * fixed 오버레이 유지. 내부 .canvas-scroll-container 에 네이티브 scroll-snap.
 * wheel 이벤트 JS 처리 없음 — 브라우저가 관성 포함 스크롤 전담.
 * JS는 scroll 이벤트로 scrollTop을 읽어 인디케이터만 업데이트한다.
 */
export function initScenarioCanvas({ onReturnToGame }) {
  const root      = document.querySelector("#scenarioCanvas");
  const container = root?.querySelector(".canvas-scroll-container");
  const counter   = document.querySelector("#scenarioCounter");
  const dots      = [...document.querySelectorAll("#scenarioIndicator .p-dot")];
  const back      = document.querySelector("#rewindBtn");
  const backLabel = back?.getAttribute("aria-label") ?? "";
  const total     = dots.length;
  let openState   = false;

  // ── 인디케이터 렌더 ──────────────────────────────────────────────────────
  function renderIndicator(idx) {
    dots.forEach((dot, i) => dot.classList.toggle("active", i === idx));
    if (counter) {
      counter.textContent =
        `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }
  }

  // ── 컨테이너 scroll 이벤트 → 인디케이터 동기화 (16px_Ref 방식) ──────────
  function onContainerScroll() {
    if (!container) return;
    const idx = Math.round(container.scrollTop / container.clientHeight);
    renderIndicator(Math.max(0, Math.min(idx, total - 1)));
  }

  // ── 열기 ─────────────────────────────────────────────────────────────────
  function open() {
    if (!root || !container) return;
    openState = true;
    // 항상 첫 슬라이드부터 (instant, 애니메이션 없이)
    container.scrollTo({ top: 0, behavior: "instant" });
    renderIndicator(0);
    root.classList.add("active");
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("scenario-open");
    back?.setAttribute("aria-label", "게임으로 돌아가기");
  }

  // ── 닫기 ─────────────────────────────────────────────────────────────────
  function close() {
    if (!root) return;
    openState = false;
    root.classList.remove("active");
    root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("scenario-open");
    back?.setAttribute("aria-label", backLabel);
    onReturnToGame();
  }

  // ── 인디케이터 점 클릭 → 해당 슬라이드로 스크롤 ─────────────────────────
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.index ?? "0");
      container?.scrollTo({
        top: idx * (container.clientHeight),
        behavior: "smooth",
      });
    });
  });

  // ── 뒤로가기 버튼 ────────────────────────────────────────────────────────
  back?.addEventListener("click", () => {
    if (openState) close();
  });

  // ── scroll 리스너 등록 ───────────────────────────────────────────────────
  container?.addEventListener("scroll", onContainerScroll, { passive: true });

  return {
    open,
    close,
    isOpen: () => openState,
  };
}
