/**
 * scroll-router.js (16px)
 *
 * §4.2 준수: wheel 이벤트 완전 제거 — 브라우저 기본 세로 스크롤 사용
 * passive scroll 리스너만 사용하여 scrollY 읽기.
 */
export function initScrollRouter({ onScroll }) {
  const handleScroll = () => {
    onScroll();
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  onScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}
