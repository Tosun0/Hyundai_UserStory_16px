/**
 * scroll-router.js (16px)
 *
 * window.scroll로 화면 상태를 갱신한다.
 * wheel은 필름과 게임의 마지막 경계에서만 선택적으로 소비한다.
 */
export function initScrollRouter({ onScroll, onWheel }) {
  const handleWheel = (event) => {
    if (!onWheel?.(event.deltaY)) return;
    event.preventDefault();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", handleWheel, { passive: false });
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", handleWheel);
  };
}
