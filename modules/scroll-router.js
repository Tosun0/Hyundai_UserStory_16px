export function initScrollRouter({ onScroll, filmStory, scenarioCanvas }) {
  let touchStartX = 0;
  let touchStartY = 0;

  // macOS trackpad sends many low-deltaY inertia events after the real gesture.
  // Track the peak |deltaY| per gesture to identify and suppress the decaying
  // inertia tail that would otherwise cause unintended extra scroll steps.
  let peakDelta = 0;
  let inertiaFlushTimer;

  function handleWheel(event) {
    const delta = event.deltaY;
    if (!delta) return;

    const absDelta = Math.abs(delta);

    // Flush peak tracker after 80 ms of silence (= new gesture starting).
    window.clearTimeout(inertiaFlushTimer);
    inertiaFlushTimer = window.setTimeout(() => { peakDelta = 0; }, 80);

    // If this event is much smaller than the peak, it is a macOS inertia
    // remnant. Pass a zero-ish delta to downstream handlers so they ignore it,
    // but still call preventDefault() when inside scenarioCanvas to stop
    // the page from scrolling.
    const isInertia = peakDelta > 0 && absDelta < peakDelta * 0.35;

    if (absDelta > peakDelta) peakDelta = absDelta;

    const effectiveDelta = isInertia ? 0 : delta;

    if (scenarioCanvas.isOpen()) {
      event.preventDefault();
      scenarioCanvas.handleWheel(effectiveDelta);
      return;
    }
    if (filmStory.handleWheel(effectiveDelta)) event.preventDefault();
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
  document.addEventListener("wheel", handleWheel, { capture: true, passive: false });
  document.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
  document.addEventListener("touchend", handleTouchEnd, { capture: true, passive: false });
  onScroll();

  return () => {
    window.clearTimeout(inertiaFlushTimer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("wheel", handleWheel, true);
    document.removeEventListener("touchstart", handleTouchStart, true);
    document.removeEventListener("touchend", handleTouchEnd, true);
  };
}
