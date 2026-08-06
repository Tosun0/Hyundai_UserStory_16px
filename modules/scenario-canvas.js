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
  let peakDelta        = 0;
  let inertiaFlushTimer;
  let cooldownUntil    = 0;
  const COOLDOWN_MS    = 500;

  // ── 가상 스페이서: 첫 슬라이드에서 위로 스크롤 시 누적 임계값 초과해야 닫힘 ──
  let closeAccum       = 0;       // 누적 위 방향 deltaY
  let closeResetTimer;
  const CLOSE_THRESHOLD = 300;   // 이 픽셀 이상 위로 스크롤해야 닫힘

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
    closeAccum = 0; // 슬라이드 이동 시 누적 리셋
    render();
  }


  // ── 진입 잠금: transitionend 전까지 아래 스크롤 차단 ────────────────────
  let isEntryLocked = false;

  function onEntryTransitionDone(e) {
    if (e.propertyName === "transform") {
      isEntryLocked = false;
      root.removeEventListener("transitionend", onEntryTransitionDone);
    }
  }

  // ── wheel 핸들러 (오버레이 전용, open 중에만 바인딩) ─────────────────────
  function handleWheel(event) {
    event.preventDefault();

    const absDelta = Math.abs(event.deltaY);
    if (!absDelta) return;

    const direction = Math.sign(event.deltaY);

    // 진입 애니메이션 중: 아래 방향만 차단, 위(닫기 방향)는 허용
    if (isEntryLocked && direction > 0) return;

    // 80ms 침묵 후 peakDelta 리셋 (새 제스처 시작)
    window.clearTimeout(inertiaFlushTimer);
    inertiaFlushTimer = window.setTimeout(() => { peakDelta = 0; }, 80);

    // 관성 잔류: peak 대비 35% 미만이면 무시
    if (peakDelta > 0 && absDelta < peakDelta * 0.35) return;
    if (absDelta > peakDelta) peakDelta = absDelta;

    // 쿨다운 중이면 무시
    const now = performance.now();
    if (now < cooldownUntil) return;

    if (direction < 0 && index === 0) {
      // 가상 스페이서: 누적 위 방향 스크롤이 임계값을 넘으면 닫힘
      closeAccum += absDelta;
      window.clearTimeout(closeResetTimer);
      closeResetTimer = window.setTimeout(() => { closeAccum = 0; }, 400);

      if (closeAccum >= CLOSE_THRESHOLD) {
        closeAccum = 0;
        close();
      }
      return;
    }

    closeAccum = 0;
    move(direction);
    cooldownUntil = now + COOLDOWN_MS;
  }

  // ── 열기 ─────────────────────────────────────────────────────────────────
  function open() {
    if (!root) return;
    openState = true;
    index = 0;
    peakDelta = 0;
    cooldownUntil = 0;
    closeAccum = 0;

    // 진입 잠금: transform 트랜지션 완료 전까지 아래 스크롤 차단
    isEntryLocked = true;
    root.addEventListener("transitionend", onEntryTransitionDone);

    render();
    root.classList.add("active");
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("scenario-open");
    back?.setAttribute("aria-label", "게임으로 돌아가기");

    // 오버레이가 열릴 때만 wheel 이벤트 바인딩
    document.addEventListener("wheel", handleWheel, { capture: true, passive: false });
  }

  // ── 닫기 ─────────────────────────────────────────────────────────────────
  function onExitTransitionDone(e) {
    // transform(720ms) 또는 visibility 중 늦게 끝나는 것 기준으로 해제
    if (e.propertyName === "transform" || e.propertyName === "visibility") {
      document.documentElement.style.overflow = "";
      root.removeEventListener("transitionend", onExitTransitionDone);
    }
  }

  function close() {
    if (!root) return;
    openState = false;

    document.removeEventListener("wheel", handleWheel, true);
    window.clearTimeout(inertiaFlushTimer);
    peakDelta = 0;

    // html 요소 기준으로 스크롤 잠금 (body 기준은 맥 Chrome에서 무효)
    document.documentElement.style.overflow = "hidden";
    root.addEventListener("transitionend", onExitTransitionDone);

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
