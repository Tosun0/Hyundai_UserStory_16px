/**
 * scenario-canvas.js (16px) — sticky-scroll 방식
 *
 * §4.2 준수: event.preventDefault() 없음
 * §5.2 준수: .canvas-sticky(position:sticky)가 뷰포트 고정 담당,
 *            #scenario-canvas section 자체는 position:relative + height 제공
 *
 * 핵심 원리:
 *  - #scenario-canvas { height: calc(6 * 100vh) } → 스크롤 소비 공간 (5 슬라이드)
 *  - .canvas-sticky { position: sticky; top: 0; } → CSS가 뷰포트 고정
 *  - passive scroll 리스너로 scrollY → 슬라이드 인덱스 매핑
 *  - open() → window.scrollTo({ top: section.offsetTop }) (이벤트 뺏기 없음)
 */
export function initScenarioCanvas({ onReturnToGame } = {}) {
  const root    = document.querySelector("#scenario-canvas");
  const track   = document.querySelector("#scenario-canvas-track");
  const counter = document.querySelector("#scenario-counter");
  const dots    = [...document.querySelectorAll("#scenario-indicator .p-dot")];
  const TOTAL   = dots.length; // 5

  let currentIndex = -1;

  // ── 렌더 ─────────────────────────────────────────────────────────────────
  function render(index) {
    currentIndex = index;
    if (track) track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    if (counter) {
      counter.textContent =
        `${String(index + 1).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`;
    }
  }

  // ── passive scroll → 슬라이드 인덱스 계산 ─────────────────────────────────
  function onScroll() {
    if (!root) return;
    const sectionTop    = root.offsetTop;
    const sectionHeight = root.offsetHeight;
    const viewportH     = window.innerHeight;
    const scrollY       = window.scrollY;
    const maxScroll     = sectionHeight - viewportH;
    if (maxScroll <= 0) return;

    const relativeScroll = scrollY - sectionTop;
    // 섹션 범위 바깥이면 무시
    if (relativeScroll < -viewportH || relativeScroll > maxScroll + viewportH) return;

    const progress   = Math.max(0, Math.min(1, relativeScroll / maxScroll));
    const slideIndex = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
    if (slideIndex !== currentIndex) render(slideIndex);
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // ── dot 클릭 → window.scrollTo ────────────────────────────────────────────
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      if (!root) return;
      const sectionTop = root.offsetTop;
      const maxScroll  = root.offsetHeight - window.innerHeight;
      // i번째 슬라이드 시작 위치 (Tech_Test 동일 공식)
      const targetY    = sectionTop + (i / TOTAL) * maxScroll;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    });
  });

  // ── open: 게임 완료 후 캔버스 섹션으로 스크롤 이동 ────────────────────────
  function open() {
    if (!root) return;
    render(0);
    window.scrollTo({ top: root.offsetTop, behavior: "smooth" });
  }

  // ── isOpen: scrollY가 캔버스 섹션 범위 내인지 확인 ────────────────────────
  function isOpen() {
    if (!root) return false;
    const sectionTop    = root.offsetTop;
    const sectionHeight = root.offsetHeight;
    const scrollY       = window.scrollY;
    // 10% 여유를 두어 섹션 진입 직전도 포함
    return scrollY >= sectionTop - window.innerHeight * 0.1 &&
           scrollY < sectionTop + sectionHeight;
  }

  // ── 초기화 ────────────────────────────────────────────────────────────────
  render(0);
  onScroll();

  return { open, isOpen };
}
