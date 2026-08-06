export function shouldAdvanceToGame({ sequence, step, direction, locked, stepCount = 3 }) {
  return !locked && sequence === 7 && step === stepCount - 1 && direction > 0;
}

export function initFilmStory() {
  const root = document.querySelector("#filmStory");
  const stage = root?.querySelector(".film-story-stage");
  const viewport = root?.querySelector(".shared-film-viewport");
  const film = root?.querySelector(".shared-film");
  const segments = [...(root?.querySelectorAll(".sequence-segment") ?? [])];
  const windows = [...(root?.querySelectorAll(".film-window") ?? [])];
  const copy = root?.querySelector(".sequence-copy");
  const title = root?.querySelector(".sequence-title");
  const bubble = root?.querySelector(".sequence-bubble");
  const transitionSpacer = root?.querySelector(".game-transition-spacer");
  const game = document.querySelector("#sq08");
  let activeSequence = 0;
  let activeStep = 0;
  let activeStepCount = 3;
  let activeState = "";
  let gameSnapLocked = false;
  let touchStartY = 0;

  function advanceToGame(direction) {
    if (!shouldAdvanceToGame({ sequence: activeSequence, step: activeStep, stepCount: activeStepCount, direction, locked: gameSnapLocked })) return false;
    gameSnapLocked = true;
    game?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => { gameSnapLocked = false; }, 1100);
    return true;
  }

  function setTitle(segment) {
    const lines = segment.dataset.title.split("|");
    const highlight = segment.dataset.highlight;
    title.replaceChildren();
    lines.forEach((line, lineIndex) => {
      if (lineIndex) title.append(document.createElement("br"));
      if (!highlight || !line.includes(highlight)) {
        title.append(document.createTextNode(line));
        return;
      }
      const [before, after] = line.split(highlight);
      const emphasis = document.createElement("span");
      emphasis.className = "title-highlight";
      emphasis.textContent = highlight;
      title.append(document.createTextNode(before), emphasis, document.createTextNode(after));
    });
  }

  function setBubble(sequence, step, text) {
    bubble.dataset.sequence = String(sequence);
    bubble.dataset.step = String(step);
    bubble.textContent = text.replaceAll("\\n", "\n");
    bubble.classList.remove("bubble-enter", "bubble-hovering", "sequence-boundary-enter");
    void bubble.offsetWidth;
    bubble.classList.add(sequence !== activeSequence ? "sequence-boundary-enter" : "bubble-enter");
    window.setTimeout(() => bubble.classList.add("bubble-hovering"), 820);
  }

  function update(scrollY) {
    if (!root || !stage || !viewport || !film || !segments.length || !title || !bubble) return;
    const viewHeight = window.innerHeight;
    const storyTop = root.getBoundingClientRect().top + scrollY;
    const storyBottom = storyTop + root.offsetHeight;
    const enter = Math.min(Math.max(1 - ((storyTop - scrollY) / viewHeight), 0), 1);
    const exit = Math.min(Math.max((storyBottom - scrollY) / (viewHeight * .08), 0), 1);
    const visible = Math.min(enter, exit);
    const spacerTop = transitionSpacer ? transitionSpacer.getBoundingClientRect().top + scrollY : storyBottom;
    const transitionStart = spacerTop + (transitionSpacer?.offsetHeight ?? 0) - (viewHeight / .7);
    const transition = Math.min(Math.max((scrollY - transitionStart) / (viewHeight / .7), 0), 1);
    const easedTransition = transition * transition * (3 - (2 * transition));
    root.style.setProperty("--film-story-visible", visible.toFixed(3));
    root.classList.toggle("is-visible", visible > 0);
    root.classList.toggle("is-entering", enter > 0 && enter < .999);
    stage.style.transform = `translate3d(0, ${(-easedTransition * viewHeight).toFixed(1)}px, 0)`;
    stage.style.opacity = (visible * (1 - easedTransition)).toFixed(3);

    let segment = segments[0];
    segments.forEach((candidate) => {
      if (scrollY >= candidate.getBoundingClientRect().top + scrollY) segment = candidate;
    });
    const sequence = Number(segment.dataset.sequence);
    const steps = Number(segment.dataset.steps || 3);
    const segmentTop = segment.getBoundingClientRect().top + scrollY;
    const progress = Math.min(Math.max((scrollY - segmentTop) / segment.offsetHeight, 0), .9999);
    const step = Math.min(Math.floor(progress * steps), steps - 1);
    const activeWindow = windows.find((windowElement) => Number(windowElement.dataset.sequence) === sequence);
    if (!activeWindow) return;
    root.dataset.currentSequence = String(sequence);
    root.dataset.currentStep = String(step);
    activeStep = step;
    activeStepCount = steps;
    const windowCenter = activeWindow.offsetTop + (activeWindow.offsetHeight / 2);
    const follow = Math.min(Math.max((enter - .18) / .82, 0), 1);
    const easedFollow = follow * follow * (3 - (2 * follow));
    film.style.transform = `translate3d(-50%, ${(viewport.clientHeight / 2) - windowCenter + ((1 - easedFollow) * viewHeight * 1.08)}px, 0)`;
    windows.forEach((windowElement) => {
      if (Number(windowElement.dataset.sequence) === sequence) {
        windowElement.dataset.activeStep = String(step);
      }
      const visibleStep = Number(windowElement.dataset.activeStep || 0);
      [...windowElement.querySelectorAll("img")].forEach((image, index) => image.classList.toggle("is-active", index === visibleStep));
    });

    const state = `${sequence}-${step}`;
    if (state !== activeState) {
      activeState = state;
      setBubble(sequence, step, segment.dataset.bubbles.split("|")[step]);
    }
    if (sequence !== activeSequence) {
      activeSequence = sequence;
      setTitle(segment);
      copy.classList.remove("sequence-boundary-enter");
      void copy.offsetWidth;
      copy.classList.add("sequence-boundary-enter");
    }
    root.classList.toggle("highlight-ready", enter > .985 && exit > .55);
  }

  window.addEventListener("wheel", (event) => {
    if (document.documentElement.classList.contains("scenario-open")) return;
    if (!event.deltaY || !advanceToGame(Math.sign(event.deltaY))) return;
    event.preventDefault();
  }, { passive: false });
  window.addEventListener("touchstart", (event) => {
    if (document.documentElement.classList.contains("scenario-open")) return;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchend", (event) => {
    if (document.documentElement.classList.contains("scenario-open")) return;
    const distanceY = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(distanceY) < 40 || !advanceToGame(Math.sign(distanceY))) return;
    event.preventDefault();
  }, { passive: false });

  return { update };
}
