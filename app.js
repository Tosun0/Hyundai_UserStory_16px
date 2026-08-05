import { initVhsIntro } from "./modules/vhs-intro.js";
import { initFilmStory } from "./modules/film-story.js";
import { initGameSequence } from "./modules/game-sequence.js";
import { initScenarioCanvas } from "./modules/scenario-canvas.js";

const intro = initVhsIntro();
const filmStory = initFilmStory();
const scenarioCanvas = initScenarioCanvas();
initGameSequence({ onComplete: scenarioCanvas.open });

let frameRequested = false;

function renderScroll() {
  frameRequested = false;
  intro.update(window.scrollY);
  filmStory.update(window.scrollY);
}

window.addEventListener("scroll", () => {
  if (frameRequested || scenarioCanvas.isOpen()) return;
  frameRequested = true;
  window.requestAnimationFrame(renderScroll);
}, { passive: true });

renderScroll();
