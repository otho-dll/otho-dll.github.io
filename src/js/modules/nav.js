// Mobile hamburger menu.
export function initNav() {
	const button = document.querySelector('.hamburger');
	const list = document.querySelector('.nav__list');
	if (!button || !list) return;

	const setOpen = (open) => {
		button.classList.toggle('is-active', open);
		list.classList.toggle('is-active', open);
		button.setAttribute('aria-expanded', String(open));
	};

	button.addEventListener('click', () => setOpen(!list.classList.contains('is-active')));

	// Close after choosing a link (matters for in-page anchors like /#contact).
	list.addEventListener('click', (event) => {
		if (event.target.closest('a')) setOpen(false);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && list.classList.contains('is-active')) {
			setOpen(false);
			button.focus();
		}
	});
}
