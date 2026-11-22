import Image, { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import path from 'node:path';

// Every <img> in the generated HTML is turned into a responsive <picture>
// (AVIF + WebP + original format) with width/height, lazy loading and async decoding.
// Sources are the originals in src/images; only resized copies end up in dist/img/.
//
// Opt-outs: add `eleventy:ignore` to an <img> (e.g. remote images),
// or `loading="eager"` for images that must load immediately (e.g. the logo).

const WIDTHS = [400, 800, 1600];
const FORMATS = ['avif', 'webp', 'auto'];

export default function images(eleventyConfig) {
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		widths: WIDTHS,
		formats: FORMATS,
		outputDir: 'dist/img/',
		urlPath: '/img/',
		failOnError: true,
		htmlOptions: {
			imgAttributes: {
				loading: 'lazy',
				decoding: 'async',
				// `auto` lets the browser use the rendered size of lazy images; the rest is a fallback.
				sizes: 'auto, (max-width: 900px) 100vw, 900px',
			},
			pictureAttributes: {},
		},
	});

	// A single 1200px JPEG for social previews (og:image), returned as a site-relative URL.
	// Usage: {{ image | ogImage }}
	eleventyConfig.addAsyncFilter('ogImage', async (src) => {
		const stats = await Image(path.join('src', src), {
			widths: [1200],
			formats: ['jpeg'],
			outputDir: 'dist/img/',
			urlPath: '/img/',
		});
		return stats.jpeg[0].url;
	});
}
