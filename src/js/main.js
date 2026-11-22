// Entry point. Each module checks for its own elements, so it is safe to run on every page.
import { initBackground } from './modules/background.js';
import { initNav } from './modules/nav.js';
import { initTyping } from './modules/typing.js';
import { initCarousel } from './modules/carousel.js';
import { initTitleMarquee } from './modules/title-marquee.js';
import { initSectionDots } from './modules/section-dots.js';
import { initAboutSlider } from './modules/about-slider.js';
import { initLightbox } from './modules/lightbox.js';

initBackground();
initNav();
initTyping();
initCarousel();
initTitleMarquee();
initSectionDots();
initAboutSlider();
initLightbox();
