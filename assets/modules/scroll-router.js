/**
 * scroll-router.js (16px)
 *
 * §4.2 준수: wheel 이벤트 완전 제거 — 브라우저 기본 세로 스크롤 사용
 * passive scroll 리스너만 사용하여 scrollY 읽기.
 */
export function initScrollRouter({ onScroll, onScrollEnd }) {
  let fallbackTimer;
  let previousScrollY = window.scrollY;
  let scrollDirection = 0;
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY !== previousScrollY) {
      scrollDirection = Math.sign(currentScrollY - previousScrollY);
      previousScrollY = currentScrollY;
    }
    onScroll();
    if (!onScrollEnd || "onscrollend" in window) return;
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => onScrollEnd(scrollDirection), 140);
  };
  const handleScrollEnd = () => onScrollEnd(scrollDirection);

  window.addEventListener("scroll", handleScroll, { passive: true });
  if (onScrollEnd && "onscrollend" in window) {
    window.addEventListener("scrollend", handleScrollEnd, { passive: true });
  }
  onScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("scrollend", handleScrollEnd);
    window.clearTimeout(fallbackTimer);
  };
}
