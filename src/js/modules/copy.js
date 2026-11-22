// Buttons with data-copy="text" copy the text to the clipboard and briefly confirm it.
// The button's own label is restored after a moment.
export function initCopyButtons() {
	document.addEventListener('click', async (event) => {
		const button = event.target.closest('[data-copy]');
		if (!button) return;

		const label = button.querySelector('[data-copy-label]') || button;
		const original = label.textContent;
		try {
			await navigator.clipboard.writeText(button.dataset.copy);
			label.textContent = 'Copied!';
		} catch {
			label.textContent = button.dataset.copy; // clipboard blocked: at least show the value
		}
		setTimeout(() => (label.textContent = original), 1500);
	});
}
