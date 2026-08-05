export function initScenarioCanvas({ onReturnToGame }) {
  const root = document.querySelector("#scenarioCanvas");
  const track = document.querySelector("#scenarioTrack");
  const counter = document.querySelector("#scenarioCounter");
  const dots = [...document.querySelectorAll("#scenarioIndicator .p-dot")];
  const back = document.querySelector("#scenarioBackButton");
  const total = dots.length;
  let index = 0;
  let openState = false;
  let wheelLocked = false;
  let touchStartX = 0;
  let touchStartY = 0;

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
    openState = true;
    index = 0;
    root.classList.add("active");
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("scenario-open");
    render();
  }

  function close() {
    openState = false;
    root.classList.remove("active");
    root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("scenario-open");
    onReturnToGame();
  }

  window.addEventListener("wheel", (event) => {
    if (!openState || wheelLocked || Math.abs(event.deltaY) < 12) return;
    event.preventDefault();
    wheelLocked = true;
    const direction = Math.sign(event.deltaY);
    if (direction < 0 && index === 0) close();
    else move(direction);
    window.setTimeout(() => { wheelLocked = false; }, 500);
  }, { passive: false });
  window.addEventListener("touchstart", (event) => {
    if (!openState) return;
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchend", (event) => {
    if (!openState) return;
    const distanceX = touchStartX - event.changedTouches[0].clientX;
    const distanceY = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(distanceX) < 40 && Math.abs(distanceY) < 40) return;
    const direction = Math.sign(Math.abs(distanceX) > Math.abs(distanceY) ? distanceX : distanceY);
    if (direction < 0 && index === 0) close();
    else move(direction);
  }, { passive: true });
  dots.forEach((dot) => dot.addEventListener("click", () => {
    index = Number(dot.dataset.index);
    render();
  }));
  back?.addEventListener("click", close);

  return { open, isOpen: () => openState };
}
