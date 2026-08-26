export function initScenarioCanvas({ onReturnToGame } = {}) {
  const root = document.querySelector("#scenario-canvas");

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
