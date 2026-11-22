import { debounce } from './motion.js';

const SPEED = 66; // px per second

// Project titles that don't fit on one line scroll endlessly (CSS animation, see home.css).
// The text is duplicated so the loop is seamless; the copy is hidden from screen readers.
export function initTitleMarquee() {
	const titles = [...document.querySelectorAll('.project-card h3')];
	if (titles.length === 0) return;

	titles.forEach((title) => (title.dataset.text = title.textContent.trim()));

	const update = () => {
		titles.forEach((title) => {
			const text = title.dataset.text;
			title.classList.remove('is-marquee');
			title.textContent = text;

			if (title.scrollWidth <= title.clientWidth) return;

			const track = document.createElement('span');
			track.className = 'marquee-track';
			const original = Object.assign(document.createElement('span'), { textContent: text });
			const copy = Object.assign(document.createElement('span'), { textContent: text });
			copy.setAttribute('aria-hidden', 'true');
			track.append(original, copy);

			title.textContent = '';
			title.append(track);
			title.classList.add('is-marquee');
			track.style.setProperty('--marquee-duration', `${original.offsetWidth / SPEED}s`);
		});
	};

	// Measure only after the pixel font has loaded, otherwise widths are wrong.
	document.fonts.ready.then(update);
	window.addEventListener('resize', debounce(update, 300));
}
