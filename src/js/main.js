// Entry point. Each module checks for its own elements, so it is safe to run on every page.
import { initBackground } from './modules/background.js';
import { initNav } from './modules/nav.js';
import { initTyping } from './modules/typing.js';
import { initTabs } from './modules/tabs.js';
import { initLightbox } from './modules/lightbox.js';
import { initCopyButtons } from './modules/copy.js';

initBackground();
initNav();
initTyping();
initTabs();
initLightbox();
initCopyButtons();
