// Tabs: <div data-tabs> with a [role="tablist"] of buttons and one [role="tabpanel"] per button,
// linked by aria-controls. Without JS every panel stays visible; this hides all but the selected one.
// Keyboard: ←/→ move between tabs, Home/End jump to the first/last (WAI-ARIA tabs pattern).
export function initTabs() {
	document.querySelectorAll('[data-tabs]').forEach((root) => {
		const tabs = [...root.querySelectorAll('[role="tab"]')];
		const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
		if (tabs.length === 0 || panels.includes(null)) return;

		const select = (index, focus = false) => {
			tabs.forEach((tab, i) => {
				const selected = i === index;
				tab.setAttribute('aria-selected', String(selected));
				tab.tabIndex = selected ? 0 : -1;
				panels[i].hidden = !selected;
			});
			if (focus) tabs[index].focus();
		};

		root.classList.add('tabs-ready');
		select(Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')));

		tabs.forEach((tab, i) => {
			tab.addEventListener('click', () => select(i));
			tab.addEventListener('keydown', (event) => {
				const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
				if (next === undefined) return;
				event.preventDefault();
				select((next + tabs.length) % tabs.length, true);
			});
		});
	});
}
