// Every project that has its own page. To add another one later: create src/projects/<name>.js like medicorerx.js,
// list it here, and give it a card (PROJECT_CARDS) so it shows in the Projects section of the home page.
// The order of PROJECT_CARDS is the order of the cards on the home page.
import { MEDICORERX, MEDICORERX_CARD } from './medicorerx.js';
import { BABY_RESEARCH, BABY_RESEARCH_CARD } from './baby-research.js';
import { BABY_VOICE, BABY_VOICE_CARD } from './baby-voice.js';
import { MAC_REMOTE, MAC_REMOTE_CARD } from './mac-remote.js';
import { AGILYSYS } from './agilysys.js';

export const PROJECT_PAGES = {
  [MEDICORERX.slug]: MEDICORERX,
  [BABY_RESEARCH.slug]: BABY_RESEARCH,
  [BABY_VOICE.slug]: BABY_VOICE,
  [MAC_REMOTE.slug]: MAC_REMOTE,
  [AGILYSYS.slug]: AGILYSYS,   // a work page: opened from the Experience section, so it has no card in Projects
};
export const PROJECT_CARDS = [MEDICORERX_CARD, BABY_RESEARCH_CARD, BABY_VOICE_CARD, MAC_REMOTE_CARD];
