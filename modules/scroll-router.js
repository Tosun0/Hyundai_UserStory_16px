/**
 * scroll-router.js (16px)
 *
 * wheel 이벤트 처리 완전 제거.
 * window.scroll 이벤트로 scrollY를 읽어 intro/filmStory 업데이트만 담당.
 * 16px_Ref 방식 그대로.
 */
export function initScrollRouter({ onScroll }) {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
  };
}
