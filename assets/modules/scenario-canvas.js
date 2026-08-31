export function initScenarioCanvas({ onReturnToGame } = {}) {
  const root = document.querySelector("#scenario-canvas");
  let isVisible = false;

  const syncVisibility = (visible) => {
    if (!root || isVisible === visible) return;
    isVisible = visible;
    root.classList.toggle("is-visible", visible);
  };

  if (root && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      syncVisibility(entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(root);
  } else {
    syncVisibility(true);
  }

  function update(scrollY = window.scrollY) {
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const rootTop = rootRect.top + scrollY;
    const game = document.querySelector("#sq08");
    const gameTop = game ? game.getBoundingClientRect().top + scrollY : rootTop;
    const isScenarioZone = rootRect.bottom > 0 && rootRect.top < window.innerHeight;
    document.documentElement.classList.toggle("scenario-open", isScenarioZone);
    document.body.classList.toggle("scenario-canvas-entered", scrollY >= rootTop);
    document.body.classList.toggle("game-to-scenario-zone", scrollY >= gameTop);
  }

  function open() {
    if (!root) return;
    window.scrollTo({ top: root.offsetTop, behavior: "smooth" });
  }

  function isOpen() {
    if (!root) return false;
    const rect = root.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  return { open, isOpen, update };
}
