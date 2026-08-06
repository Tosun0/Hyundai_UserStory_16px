import { initVhsIntro } from "./modules/vhs-intro.js";
import { initFilmStory } from "./modules/film-story.js";
import { initGameSequence } from "./modules/game-sequence.js";
import { initScenarioCanvas } from "./modules/scenario-canvas.js";
import { initScrollRouter } from "./modules/scroll-router.js";

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

initScrollRouter({ onScroll: renderScroll, filmStory, scenarioCanvas });
