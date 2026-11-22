import { pausableInterval, prefersReducedMotion } from './motion.js';

const DELAY = 4000;

// Cross-fading photos in the "About me" section (fade is done in CSS via .active).
// Starts once the section scrolls into view, so the extra photos aren't loaded up front.
export function initAboutSlider() {
	const slides = [...document.querySelectorAll('.about-slide')];
	if (slides.length < 2 || prefersReducedMotion()) return;

	const start = () => {
		slides.forEach((img) => (img.loading = 'eager'));

		let current = 0;
		pausableInterval(() => {
			slides[current].classList.remove('active');
			current = (current + 1) % slides.length;
			slides[current].classList.add('active');
		}, DELAY);
	};

	const observer = new IntersectionObserver((entries) => {
		if (entries.some((entry) => entry.isIntersecting)) {
			observer.disconnect();
			start();
		}
	});
	observer.observe(slides[0].closest('.about-image-wrapper') || slides[0]);
}
