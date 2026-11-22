// Shared helpers for animations and timers.

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => reducedMotionQuery.matches;

export function debounce(fn, delay = 200) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};
}

/**
 * setInterval that pauses while the tab is hidden or `isPaused()` returns true.
 * Returns a function that restarts the countdown (e.g. after manual navigation).
 */
export function pausableInterval(callback, delay, isPaused = () => false) {
	let timer;

	const start = () => {
		clearInterval(timer);
		timer = setInterval(() => {
			if (!document.hidden && !isPaused()) callback();
		}, delay);
	};

	start();
	return start;
}
