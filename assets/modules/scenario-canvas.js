export function initScenarioCanvas({ onReturnToGame } = {}) {
  const root = document.querySelector("#scenario-canvas");
  let isVisible = false;

  const syncVisibility = (visible) => {
    if (!root || isVisible === visible) return;
    isVisible = visible;
    root.classList.toggle("is-visible", visible);
    document.body.classList.toggle("scenario-canvas-visible", visible);
  };

  if (root && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      syncVisibility(entry.isIntersecting);
    }, { threshold: 0.12 });
    observer.observe(root);
  } else {
    syncVisibility(true);
  }

  function update() {}

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
