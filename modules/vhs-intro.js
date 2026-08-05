export function initVhsIntro() {
  const root = document.querySelector("#sq01");
  const frames = [...document.querySelectorAll(".story-frame")];
  const note = document.querySelector("#noteText");
  const glitch = document.querySelector("#glitchOverlay");
  const prompt = document.querySelector("#scrollPrompt");
  const rewind = document.querySelector("#rewindBtn");
  const notes = [
    "일정은 똑같은데, 대중교통은 힘들고...<br>어쩔 수 없지만 운전은 해야겠어.",
    "버스는 40분에 한 대뿐이고... 장을 보러 갈 때는<br>무거운 짐 때문에 결국 차를 끌고 나와.",
    "모두의 안전과 나의 자유로운 이동,<br>서로를 이해하는 대안이 필요해.",
  ];
  let activeIndex = 0;

  function showFrame(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    frames.forEach((frame, frameIndex) => frame.classList.toggle("active", frameIndex === index));
    glitch?.classList.add("active");
    window.setTimeout(() => glitch?.classList.remove("active"), 200);
    if (note) note.innerHTML = notes[index];
  }

  function update(scrollY) {
    const progress = Math.min(Math.max(scrollY / Math.max(root?.offsetHeight ?? 1, 1), 0), 1);
    const exit = Math.min(Math.max((progress - .08) / .82, 0), 1);
    document.documentElement.style.setProperty("--sq01-exit", exit.toFixed(3));
    if (prompt) prompt.style.pointerEvents = exit > .8 ? "none" : "auto";
    showFrame(progress > .65 ? 2 : progress > .3 ? 1 : 0);
  }

  prompt?.addEventListener("click", () => document.querySelector("#sq02")?.scrollIntoView({ behavior: "smooth" }));
  rewind?.addEventListener("click", () => {
    if (!document.documentElement.classList.contains("scenario-open")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  return { update };
}
