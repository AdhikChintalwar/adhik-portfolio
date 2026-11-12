// Every project that has its own page. To add another one later: create src/projects/<name>.js like medicorerx.js,
// list it here, and give it a card (PROJECT_CARDS) so it shows in the Projects section of the home page.
import { MEDICORERX, MEDICORERX_CARD } from './medicorerx.js';

export const PROJECT_PAGES = { [MEDICORERX.slug]: MEDICORERX };
export const PROJECT_CARDS = [MEDICORERX_CARD];
