export function nextGameProgress(current, eventType) {
  if (eventType === "canvas-playbook:game-started") return "playing";
  if (eventType === "canvas-playbook:game-complete") return "completed";
  return current;
}

export function initGameSequence({ onComplete }) {
  const root = document.querySelector("#sq08");
  const frame = root?.querySelector(".game-frame");
  const skip = document.querySelector("#gameSkipButton");
  if (!root) return;
  let progress = "not-started";
  let scenarioVisible = false;

  const syncVisibility = (visible) => frame?.contentWindow?.postMessage({
    type: "canvas-playbook:game-visibility",
    visible,
  }, "*");

  const openScenario = () => {
    if (scenarioVisible) return;
    scenarioVisible = true;
    syncVisibility(false);
    onComplete();
  };

  const reset = () => {
    scenarioVisible = false;
    frame?.contentWindow?.postMessage({ type: "canvas-playbook:game-reset" }, "*");
    syncVisibility(true);
  };

  const observer = new IntersectionObserver((entries) => {
    const ratio = entries.reduce((highest, entry) => entry.isIntersecting ? Math.max(highest, entry.intersectionRatio) : highest, 0);
    const active = ratio >= .995;
    root.classList.toggle("is-entering", ratio > .01 && !active);
    root.classList.toggle("is-active", active);
    document.body.classList.toggle("game-entering", ratio > .01);
    document.body.classList.toggle("game-active", active);
    document.body.classList.toggle("game-chrome-hidden", ratio >= .9);
    syncVisibility(active);
  }, { threshold: [0, .01, .5, .9, .995, 1] });

  frame?.addEventListener("load", () => syncVisibility(root.classList.contains("is-active")));
  window.addEventListener("message", (event) => {
    if (event.source !== frame?.contentWindow) return;
    const type = event.data?.type;
    progress = nextGameProgress(progress, type);
    if (type === "canvas-playbook:scenario-open") openScenario();
    if (type === "canvas-playbook:game-complete" && root.classList.contains("is-active")) openScenario();
  });
  skip?.addEventListener("click", openScenario);
  observer.observe(root);

  return { reset, getProgress: () => progress };
}
