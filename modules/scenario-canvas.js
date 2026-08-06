export function initScenarioCanvas({ onReturnToGame }) {
  const root = document.querySelector("#scenarioCanvas");
  const track = document.querySelector("#scenarioTrack");
  const counter = document.querySelector("#scenarioCounter");
  const dots = [...document.querySelectorAll("#scenarioIndicator .p-dot")];
  const back = document.querySelector("#rewindBtn");
  const backLabel = back?.getAttribute("aria-label") ?? "";
  const total = dots.length;
  let index = 0;
  let openState = false;
  let wheelLocked = false;
  let wheelUnlockTimer;

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }

  function move(direction) {
    index = Math.max(0, Math.min(index + direction, total - 1));
    render();
  }

  function open() {
    window.clearTimeout(wheelUnlockTimer);
    wheelLocked = false;
    openState = true;
    index = 0;
    root.classList.add("active");
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("scenario-open");
    back?.setAttribute("aria-label", "게임으로 돌아가기");
    render();
  }

  function close() {
    window.clearTimeout(wheelUnlockTimer);
    wheelLocked = false;
    openState = false;
    root.classList.remove("active");
    root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("scenario-open");
    back?.setAttribute("aria-label", backLabel);
    onReturnToGame();
  }

  function handleWheel(deltaY) {
    if (!openState) return false;
    window.clearTimeout(wheelUnlockTimer);
    // 500 ms covers the full macOS trackpad inertia decay tail.
    wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false; }, 500);
    if (wheelLocked || !deltaY) return true;
    wheelLocked = true;
    const direction = Math.sign(deltaY);
    if (direction < 0 && index === 0) close();
    else move(direction);
    return true;
  }

  function handleSwipe(direction) {
    if (!openState || !direction) return false;
    if (direction < 0 && index === 0) close();
    else move(direction);
    return true;
  }
  dots.forEach((dot) => dot.addEventListener("click", () => {
    index = Number(dot.dataset.index);
    render();
  }));
  back?.addEventListener("click", close);

  return { open, isOpen: () => openState, handleWheel, handleSwipe };
}
