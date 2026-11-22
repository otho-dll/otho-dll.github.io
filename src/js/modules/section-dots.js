// Side navigation dots on the home page: highlights the section that is most visible
// and keeps the URL hash in sync without adding history entries.
export function initSectionDots() {
	const dots = [...document.querySelectorAll('.dot-nav .dot')];
	const sections = [...document.querySelectorAll('.home-section[id]')];
	if (dots.length === 0 || sections.length === 0) return;

	const visibility = new Map();
	let activeId = '';

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => visibility.set(entry.target.id, entry.intersectionRatio));

			const [mostVisibleId, ratio] = [...visibility].reduce((best, item) => (item[1] > best[1] ? item : best), ['', 0]);
			if (!mostVisibleId || ratio === 0 || mostVisibleId === activeId) return;

			activeId = mostVisibleId;
			dots.forEach((dot) => {
				const isActive = dot.getAttribute('href') === `#${activeId}`;
				dot.classList.toggle('active', isActive);
				dot.toggleAttribute('aria-current', isActive);
			});
			history.replaceState(null, '', `#${activeId}`);
		},
		{ threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
	);

	sections.forEach((section) => observer.observe(section));
}
