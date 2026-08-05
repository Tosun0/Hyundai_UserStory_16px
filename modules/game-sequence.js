export function initGameSequence({ onComplete }) {
  const root = document.querySelector("#sq08");
  const frame = root?.querySelector(".game-frame");
  const skip = document.querySelector("#gameSkipButton");
  if (!root) return;

  const syncVisibility = (visible) => frame?.contentWindow?.postMessage({
    type: "canvas-playbook:game-visibility",
    visible,
  }, "*");

  const observer = new IntersectionObserver((entries) => {
    const ratio = entries.reduce((highest, entry) => entry.isIntersecting ? Math.max(highest, entry.intersectionRatio) : highest, 0);
    const active = ratio >= .995;
    root.classList.toggle("is-entering", ratio > .01 && !active);
    root.classList.toggle("is-active", active);
    document.body.classList.toggle("game-entering", ratio > .01);
    document.body.classList.toggle("game-active", active);
    document.body.classList.toggle("game-chrome-hidden", ratio >= .9);
    document.body.style.setProperty("--game-chrome-opacity", Math.min(Math.max((.9 - ratio) / .2, 0), 1).toFixed(3));
    syncVisibility(active);
  }, { threshold: [0, .01, .5, .9, .995, 1] });

  frame?.addEventListener("load", () => syncVisibility(root.classList.contains("is-active")));
  skip?.addEventListener("click", onComplete);
  observer.observe(root);
}
