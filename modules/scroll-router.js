export function initScrollRouter({ onScroll, filmStory, scenarioCanvas }) {
  let touchStartX = 0;
  let touchStartY = 0;

  function handleWheel(event) {
    if (!event.deltaY) return;
    if (scenarioCanvas.isOpen()) {
      event.preventDefault();
      scenarioCanvas.handleWheel(event.deltaY);
      return;
    }
    if (filmStory.handleWheel(event.deltaY)) event.preventDefault();
  }

  function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }

  function handleTouchEnd(event) {
    const distanceX = touchStartX - event.changedTouches[0].clientX;
    const distanceY = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(distanceX) < 40 && Math.abs(distanceY) < 40) return;
    const direction = Math.sign(Math.abs(distanceX) > Math.abs(distanceY) ? distanceX : distanceY);
    const handled = scenarioCanvas.isOpen()
      ? scenarioCanvas.handleSwipe(direction)
      : filmStory.handleSwipe(direction);
    if (handled) event.preventDefault();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: false });
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
  };
}
