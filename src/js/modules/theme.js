// Light/dark theme. The inline script in base.njk applies the theme before the first paint;
// this module wires up the toggle buttons and keeps following the system setting until
// the visitor picks a theme themselves (that choice is remembered in localStorage).
// Other modules listen for the `themechange` event on document (e.g. the background).

const STORAGE_KEY = 'theme';
const systemLight = window.matchMedia('(prefers-color-scheme: light)');

function savedTheme() {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value === 'light' || value === 'dark' ? value : null;
	} catch {
		return null;
	}
}

function applyTheme(theme) {
	if (document.documentElement.dataset.theme === theme) return;
	document.documentElement.dataset.theme = theme;
	document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function initTheme() {
	const buttons = [...document.querySelectorAll('[data-theme-toggle]')];

	const updateButtons = () => {
		const isLight = document.documentElement.dataset.theme === 'light';
		buttons.forEach((button) => {
			button.setAttribute('aria-pressed', String(isLight));
			button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
		});
	};

	buttons.forEach((button) =>
		button.addEventListener('click', () => {
			const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
			try {
				localStorage.setItem(STORAGE_KEY, next);
			} catch {
				// Storage blocked: the choice lasts until the page is closed.
			}
			applyTheme(next);
		}),
	);

	systemLight.addEventListener('change', (event) => {
		if (!savedTheme()) applyTheme(event.matches ? 'light' : 'dark');
	});

	document.addEventListener('themechange', updateButtons);
	updateButtons();
}
