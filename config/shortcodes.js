import Fetch from '@11ty/eleventy-fetch';

// Shortcodes for embeds used inside blog posts.
// Output is kept on as few lines as possible and never contains blank lines,
// otherwise Markdown would end the HTML block and start wrapping it in <p>.

const escapeHtml = (value = '') =>
	String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');

const html = (parts) => parts.filter(Boolean).join('');

const ICONS = {
	github:
		'<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-1.12.53-1.13.54-.34.19-.73.9-.82 1.13-.16.45-.31.81-.31.81C2.29 14.53 0 11.54 0 8c0-4.42 3.58-8 8-8z"/></svg>',
	package:
		'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
	file:
		'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
	chevron:
		'<svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
};

// Repo description from the GitHub API, cached for a day in .cache/.
// A failed request must never break the build — the card just has no description.
async function getRepoDescription(repo) {
	const headers = { 'User-Agent': 'anulab-website-build' };
	if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

	try {
		const data = await Fetch(`https://api.github.com/repos/${repo}`, {
			duration: '1d',
			type: 'json',
			fetchOptions: { headers },
		});
		return data.description || '';
	} catch (error) {
		console.warn(`[githubCard] Could not fetch description for ${repo}: ${error.message}`);
		return '';
	}
}

export default function shortcodes(eleventyConfig) {
	// {% githubCard "owner/repo" %}
	eleventyConfig.addAsyncShortcode('githubCard', async (repo) => {
		const description = await getRepoDescription(repo);
		const safeRepo = escapeHtml(repo);
		return html([
			// The wrapping <div> makes Markdown treat this as an HTML block instead of inline text in a <p>.
			'<div class="embed">',
			`<a href="https://github.com/${safeRepo}" target="_blank" rel="noopener noreferrer" class="embed-card github-card">`,
			'<div class="embed-image">',
			// Remote preview image: skip the local image pipeline.
			`<img src="https://opengraph.githubassets.com/1/${safeRepo}" alt="" loading="lazy" decoding="async" width="1200" height="600" eleventy:ignore>`,
			'</div>',
			'<div class="embed-info">',
			`<div class="embed-title">${ICONS.github}<span>${safeRepo}</span></div>`,
			description && `<p class="embed-desc">${escapeHtml(description)}</p>`,
			'</div>',
			'</a>',
			'</div>',
		]);
	});

	// {% printablesCard "https://www.printables.com/model/…", "Title", "Optional description" %}
	eleventyConfig.addShortcode('printablesCard', (url, title, desc) =>
		html([
			'<div class="embed">',
			`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="embed-card printables-card">`,
			`<div class="printables-icon">${ICONS.package}</div>`,
			'<div class="embed-info">',
			`<div class="embed-title"><span class="printables-brand">Printables</span><span>${escapeHtml(title)}</span></div>`,
			desc && `<p class="embed-desc">${escapeHtml(desc)}</p>`,
			'</div>',
			'</a>',
			'</div>',
		]),
	);

	// {% pdfEmbed "/blog/data/file.pdf", "Title" %}
	eleventyConfig.addShortcode('pdfEmbed', (url, title = 'PDF Document') =>
		html([
			'<details class="embed-pdf-wrapper">',
			'<summary class="embed-pdf-header">',
			`<div class="embed-pdf-title">${ICONS.file}<span>${escapeHtml(title)}</span>`,
			`<span class="embed-pdf-hint">Click to expand ${ICONS.chevron}</span></div>`,
			`<a href="${escapeHtml(url)}" class="embed-pdf-download" download>Download &darr;</a>`,
			'</summary>',
			'<div class="embed-pdf-body">',
			`<iframe src="${escapeHtml(url)}" title="${escapeHtml(title)}" loading="lazy">Your browser does not support PDF preview. <a href="${escapeHtml(url)}">Download the PDF</a>.</iframe>`,
			'</div>',
			'</details>',
		]),
	);

	// {% gallery ["/images/a.png", "/images/b.png"], "Optional alt text" %}
	// Shows up to two thumbnails; the second one becomes a "+N" tile when there are more.
	// Every image opens in the lightbox (see js/lightbox.js); extra images stay hidden until then.
	eleventyConfig.addShortcode('gallery', (images = [], alt = '') => {
		const total = images.length;
		const tiles = images.map((src, i) => {
			const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt || `Image ${i + 1} of ${total}`)}" class="gallery-thumb">`;
			if (i >= 2) return `<div class="gallery-tile" hidden>${img}</div>`;
			const overlay =
				i === 1 && total > 2
					? `<span class="gallery-more">+${total - 1}</span>`
					: '<span class="gallery-hint">Zoom in</span>';
			return `<button type="button" class="gallery-tile" aria-label="Open image ${i + 1} of ${total}">${img}${overlay}</button>`;
		});
		return `<div class="gallery${total === 1 ? ' gallery--single' : ''}" data-lightbox-group>${tiles.join('')}</div>`;
	});
}
