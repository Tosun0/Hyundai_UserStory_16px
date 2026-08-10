/**
 * scroll-router.js (16px)
 *
 * window.scroll로 화면 상태를 갱신한다.
 * §4.2 준수: wheel 이벤트에 event.preventDefault() 호출 금지
 */
export function initScrollRouter({ onScroll, onWheel }) {
  const handleWheel = (event) => {
    if (!onWheel?.(event.deltaY)) return;
    // §4.2: event.preventDefault() 제거 — 브라우저 기본 스크롤 유지
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", handleWheel, { passive: false });
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", handleWheel);
  };
}
