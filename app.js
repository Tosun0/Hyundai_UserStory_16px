import { initVhsIntro } from "./modules/vhs-intro.js";
import { initFilmStory } from "./modules/film-story.js";
import { initGameSequence } from "./modules/game-sequence.js";
import { initScenarioCanvas } from "./modules/scenario-canvas.js";

const intro = initVhsIntro();
const filmStory = initFilmStory();
let gameSequence;
const scenarioCanvas = initScenarioCanvas({ onReturnToGame: () => gameSequence.reset() });
gameSequence = initGameSequence({ onComplete: scenarioCanvas.open });

function renderScroll() {
  if (scenarioCanvas.isOpen()) return;
  intro.update(window.scrollY);
  filmStory.update(window.scrollY);
}

window.addEventListener("scroll", renderScroll, { passive: true });

renderScroll();
