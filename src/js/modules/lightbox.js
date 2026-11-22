// One image viewer for the whole post (the <dialog class="lightbox"> in post.njk).
//
// - Gallery tiles ({% gallery %}) open their own gallery and can page through it.
// - Standalone images in the post body open on their own.
// Escape and the focus trap come from the native <dialog>.

// The image pipeline renders <picture> with several widths; show the largest one.
function fullSizeUrl(img) {
	const source = img.closest('picture')?.querySelector('source[type="image/webp"]');
	const candidates = (source?.srcset || img.srcset || '')
		.split(',')
		.map((entry) => entry.trim().split(/\s+/))
		.filter(([url]) => url)
		.map(([url, width = '0w']) => ({ url, width: parseInt(width, 10) }));

	if (candidates.length === 0) return img.currentSrc || img.src;
	return candidates.reduce((a, b) => (b.width > a.width ? b : a)).url;
}

export function initLightbox() {
	const dialog = document.querySelector('dialog.lightbox');
	const content = document.querySelector('.post-content');
	if (!dialog || !content) return;

	const image = dialog.querySelector('.lightbox-image');
	let items = [];
	let index = 0;

	const show = (i) => {
		index = (i + items.length) % items.length;
		image.src = items[index].src;
		image.alt = items[index].alt;
	};

	const open = (imgs, startIndex) => {
		items = imgs.map((img) => ({ src: fullSizeUrl(img), alt: img.alt }));
		dialog.toggleAttribute('data-single', items.length === 1);
		show(startIndex);
		dialog.showModal();
	};

	content.addEventListener('click', (event) => {
		const tile = event.target.closest('.gallery-tile');
		if (tile) {
			const group = tile.closest('[data-lightbox-group]');
			const imgs = [...group.querySelectorAll('img')];
			open(imgs, imgs.indexOf(tile.querySelector('img')));
			return;
		}

		const img = event.target.closest('img');
		if (img && !img.closest('a, .embed-card, [data-lightbox-group]')) open([img], 0);
	});

	dialog.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
	dialog.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
	dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());

	// Clicking the dimmed area around the image closes the viewer.
	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) dialog.close();
	});

	dialog.addEventListener('keydown', (event) => {
		if (items.length < 2) return;
		if (event.key === 'ArrowRight') show(index + 1);
		if (event.key === 'ArrowLeft') show(index - 1);
	});

	dialog.addEventListener('close', () => image.removeAttribute('src'));
}
