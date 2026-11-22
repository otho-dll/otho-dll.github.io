import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const hashCache = new Map();

export default function filters(eleventyConfig) {
	// "Aug 30 2026" — the format the site has always used for post dates.
	eleventyConfig.addFilter('readableDate', (date) => new Date(date).toDateString().slice(4));

	// Machine-readable date for <time datetime="…">.
	eleventyConfig.addFilter('isoDate', (date) => new Date(date).toISOString().slice(0, 10));

	// Appends a short content hash so browsers re-download CSS/JS only when it changes.
	// Usage: {{ '/css/style.css' | versioned }}
	eleventyConfig.addFilter('versioned', (url) => {
		if (!hashCache.has(url)) {
			const file = path.join('src', url);
			const hash = createHash('md5').update(readFileSync(file)).digest('hex').slice(0, 8);
			hashCache.set(url, `${url}?v=${hash}`);
		}
		return hashCache.get(url);
	});

	// Hashes must be recomputed when files change during `npm start`.
	eleventyConfig.on('eleventy.before', () => hashCache.clear());

	eleventyConfig.addFilter('absoluteUrl', (url, base) => new URL(url, base).href);
}
