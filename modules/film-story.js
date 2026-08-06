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
  let highlightLatched = false;   // 한 번 켜지면 게임 구역 진입 후에도 유지

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

    // sequence 5, step 0 → 딸의 전화 수신 알림 UI (16px_Ref 방식)
    if (sequence === 5 && step === 0) {
      const callHeader = document.createElement("span");
      callHeader.className = "call-voice-header";
      callHeader.setAttribute("aria-hidden", "true");

      const callIcon = document.createElement("span");
      callIcon.className = "call-voice-icon";
      callIcon.textContent = "☎";

      const callLabel = document.createElement("span");
      callLabel.className = "call-voice-label";
      callLabel.textContent = "사랑하는 딸 ❤️";

      const callWave = document.createElement("span");
      callWave.className = "call-voice-wave";
      for (let i = 0; i < 5; i += 1) {
        callWave.append(document.createElement("i"));
      }
      callHeader.append(callIcon, callLabel, callWave);

      const callCopy = document.createElement("span");
      callCopy.className = "call-voice-copy";
      text.replaceAll("\\n", "\n").split("\n").forEach((line) => {
        const lineEl = document.createElement("span");
        lineEl.className = "call-voice-line";
        lineEl.textContent = line;
        callCopy.append(lineEl);
      });

      bubble.replaceChildren(callHeader, callCopy);
    } else {
      bubble.textContent = text.replaceAll("\\n", "\n");
    }

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
    // highlight-ready: 완전 진입 시 켜지고, 게임 구역으로 내려가도 꺼지지 않음
    if (enter > .985 && exit > .55) highlightLatched = true;
    // filmStory 위쪽으로 완전히 벗어나면(enter=0) 리셋
    if (enter < .01) highlightLatched = false;
    root.classList.toggle("highlight-ready", highlightLatched);
  }

  function handleWheel(deltaY) {
    if (document.documentElement.classList.contains("scenario-open") || !deltaY) return false;
    return advanceToGame(Math.sign(deltaY));
  }

  function handleSwipe(direction) {
    if (document.documentElement.classList.contains("scenario-open") || !direction) return false;
    return advanceToGame(direction);
  }

  return { update, handleWheel, handleSwipe };
}
