export function initVhsIntro() {
  const root = document.querySelector("#cover");
  const frames = [...document.querySelectorAll(".story-frame")];
  const glitch = document.querySelector("#glitchOverlay");
  const prompt = document.querySelector("#scrollPrompt");
  const rewind = document.querySelector("#rewindBtn");
  const filmStory = document.querySelector("#playbook");
  let activeIndex = 0;
  let filmSnapLocked = false;

  function showFrame(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    frames.forEach((frame, frameIndex) => frame.classList.toggle("active", frameIndex === index));
    glitch?.classList.add("active");
    window.setTimeout(() => glitch?.classList.remove("active"), 200);
  }

  function update(scrollY) {
    const progress = Math.min(Math.max(scrollY / Math.max(root?.offsetHeight ?? 1, 1), 0), 1);
    const exit = Math.min(Math.max((progress - .08) / .82, 0), 1);
    document.documentElement.style.setProperty("--sq01-exit", exit.toFixed(3));
    if (prompt) prompt.style.pointerEvents = exit > .8 ? "none" : "auto";
    showFrame(progress > .65 ? 2 : progress > .3 ? 1 : 0);
  }

  function handleWheel(deltaY) {
    if (!filmStory || deltaY <= 0) return false;
    const filmTop = filmStory.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY >= filmTop - 1) return false;
    if (!filmSnapLocked) {
      filmSnapLocked = true;
      filmStory.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => { filmSnapLocked = false; }, 900);
    }
    return true;
  }

  prompt?.addEventListener("click", () => document.querySelector("#sq02")?.scrollIntoView({ behavior: "smooth" }));
  rewind?.addEventListener("click", () => {
    if (!document.documentElement.classList.contains("scenario-open")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  return { update, handleWheel };
}
