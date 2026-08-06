/**
 * scenario-canvas.js (16px)
 *
 * fixed 오버레이 유지. 슬라이드는 translateX 가로 전환 (원본 동작).
 * 오버레이가 열릴 때만 wheel 리스너를 부착하고, 닫힐 때 제거한다.
 * → 메인 페이지 filmStory 스크롤과 wheel 이벤트 충돌 없음.
 * macOS 관성 이벤트는 peakDelta 필터 + 500ms 쿨다운으로 차단.
 */
export function initScenarioCanvas({ onReturnToGame }) {
  const root    = document.querySelector("#scenarioCanvas");
  const track   = document.querySelector("#scenarioTrack");
  const counter = document.querySelector("#scenarioCounter");
  const dots    = [...document.querySelectorAll("#scenarioIndicator .p-dot")];
  const back    = document.querySelector("#rewindBtn");
  const backLabel = back?.getAttribute("aria-label") ?? "";
  const total   = dots.length;

  let index      = 0;
  let openState  = false;

  // ── 맥 관성 필터 상태 ────────────────────────────────────────────────────
  let peakDelta       = 0;
  let inertiaFlushTimer;
  let cooldownUntil   = 0;        // performance.now() 기준
  const COOLDOWN_MS   = 500;

  // ── 렌더 ─────────────────────────────────────────────────────────────────
  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    if (counter) {
      counter.textContent =
        `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }
  }

  function move(direction) {
    index = Math.max(0, Math.min(index + direction, total - 1));
    render();
  }

  // ── wheel 핸들러 (오버레이 전용, open 중에만 바인딩) ─────────────────────
  function handleWheel(event) {
    event.preventDefault();

    const absDelta = Math.abs(event.deltaY);
    if (!absDelta) return;

    // 80ms 침묵 후 peakDelta 리셋 (새 제스처 시작)
    window.clearTimeout(inertiaFlushTimer);
    inertiaFlushTimer = window.setTimeout(() => { peakDelta = 0; }, 80);

    // 관성 잔류: peak 대비 35% 미만이면 무시
    if (peakDelta > 0 && absDelta < peakDelta * 0.35) return;
    if (absDelta > peakDelta) peakDelta = absDelta;

    // 쿨다운 중이면 무시
    const now = performance.now();
    if (now < cooldownUntil) return;

    const direction = Math.sign(event.deltaY);

    if (direction < 0 && index === 0) {
      close();
    } else {
      move(direction);
    }

    cooldownUntil = now + COOLDOWN_MS;
  }

  // ── 열기 ─────────────────────────────────────────────────────────────────
  function open() {
    if (!root) return;
    openState = true;
    index = 0;
    peakDelta = 0;
    cooldownUntil = 0;
    render();
    root.classList.add("active");
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("scenario-open");
    back?.setAttribute("aria-label", "게임으로 돌아가기");

    // 오버레이가 열릴 때만 wheel 이벤트 바인딩
    document.addEventListener("wheel", handleWheel, { capture: true, passive: false });
  }

  // ── 닫기 ─────────────────────────────────────────────────────────────────
  function close() {
    if (!root) return;
    openState = false;
    // 오버레이가 닫히면 즉시 wheel 이벤트 해제 → filmStory 충돌 없음
    document.removeEventListener("wheel", handleWheel, true);
    window.clearTimeout(inertiaFlushTimer);
    peakDelta = 0;

    root.classList.remove("active");
    root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("scenario-open");
    back?.setAttribute("aria-label", backLabel);
    onReturnToGame();
  }

  // ── 인디케이터 점 클릭 ───────────────────────────────────────────────────
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      index = Number(dot.dataset.index ?? "0");
      render();
    });
  });

  // ── 뒤로가기 버튼 ────────────────────────────────────────────────────────
  back?.addEventListener("click", () => {
    if (openState) close();
  });

  // ── 터치 스와이프 ────────────────────────────────────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener("touchstart", (e) => {
    if (!openState) return;
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    if (!openState) return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
    const direction = Math.sign(Math.abs(dx) > Math.abs(dy) ? dx : dy);
    if (direction < 0 && index === 0) close();
    else move(direction);
  }, { passive: true });

  return {
    open,
    close,
    isOpen: () => openState,
  };
}
