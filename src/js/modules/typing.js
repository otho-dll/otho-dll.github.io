import { prefersReducedMotion } from './motion.js';

const TYPE_DELAY = 100;
const DELETE_DELAY = 50;
const HOLD_DELAY = 2000; // full word stays visible
const NEXT_DELAY = 500; // pause before typing the next word

// Hero "I am a …" typewriter. Roles come from data-roles (JSON array).
// The first role is already rendered in HTML, so the effect starts by deleting it.
export function initTyping() {
	const container = document.querySelector('.hero-role');
	const output = container?.querySelector('.typing-text');
	if (!container || !output) return;

	let roles;
	try {
		roles = JSON.parse(container.dataset.roles || '[]');
	} catch {
		return;
	}

	output.classList.add('text-blue');
	container.querySelector('.cursor')?.classList.add('text-blue');

	if (roles.length < 2 || prefersReducedMotion()) return;

	let roleIndex = 0;
	let charIndex = roles[0].length;
	let deleting = true;

	const tick = () => {
		const role = roles[roleIndex];
		charIndex += deleting ? -1 : 1;
		output.textContent = role.slice(0, charIndex);

		let delay = deleting ? DELETE_DELAY : TYPE_DELAY;

		if (!deleting && charIndex === role.length) {
			deleting = true;
			delay = HOLD_DELAY;
		} else if (deleting && charIndex === 0) {
			deleting = false;
			roleIndex = (roleIndex + 1) % roles.length;
			delay = NEXT_DELAY;
		}

		setTimeout(tick, delay);
	};

	setTimeout(tick, HOLD_DELAY);
}
