import { pausableInterval, prefersReducedMotion } from './motion.js';

const AUTOPLAY_DELAY = 15000;
const SWIPE_THRESHOLD = 50; // px

// Projects carousel on the home page: arrows, dots, swipe, keyboard and autoplay.
// Autoplay pauses while the pointer or keyboard focus is inside, the tab is hidden,
// or the visitor prefers reduced motion.
export function initCarousel() {
	const root = document.querySelector('.carousel-container');
	const track = root?.querySelector('.carousel-track');
	const slides = track ? [...track.querySelectorAll('.carousel-slide')] : [];
	if (!root || slides.length === 0) return;

	const dots = [...root.querySelectorAll('.carousel-dot')];
	let current = 0;
	let hovered = false;

	const goTo = (index) => {
		current = (index + slides.length) % slides.length;
		track.style.transform = `translateX(-${current * 100}%)`;

		slides.forEach((slide, i) => {
			// Off-screen slides must not be reachable with Tab or read by screen readers.
			slide.inert = i !== current;
		});
		dots.forEach((dot, i) => {
			dot.classList.toggle('active', i === current);
			dot.toggleAttribute('aria-current', i === current);
		});
	};

	let restartAutoplay = () => {};
	if (!prefersReducedMotion() && slides.length > 1) {
		restartAutoplay = pausableInterval(
			() => goTo(current + 1),
			AUTOPLAY_DELAY,
			() => hovered || root.contains(document.activeElement),
		);
	}

	const navigate = (index) => {
		goTo(index);
		restartAutoplay();
	};

	root.querySelector('.right-arrow')?.addEventListener('click', () => navigate(current + 1));
	root.querySelector('.left-arrow')?.addEventListener('click', () => navigate(current - 1));
	dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));

	root.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowRight') navigate(current + 1);
		if (event.key === 'ArrowLeft') navigate(current - 1);
	});

	root.addEventListener('pointerenter', () => (hovered = true));
	root.addEventListener('pointerleave', () => (hovered = false));

	let touchStartX = 0;
	track.addEventListener('touchstart', (event) => {
		touchStartX = event.changedTouches[0].screenX;
	}, { passive: true });
	track.addEventListener('touchend', (event) => {
		const distance = event.changedTouches[0].screenX - touchStartX;
		if (Math.abs(distance) > SWIPE_THRESHOLD) navigate(current + (distance < 0 ? 1 : -1));
	}, { passive: true });

	goTo(0);
}
