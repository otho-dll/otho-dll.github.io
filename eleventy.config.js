import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import collections from './config/collections.js';
import filters from './config/filters.js';
import images from './config/images.js';
import shortcodes from './config/shortcodes.js';

// All editable texts and options (see src/content/settings.yml).
const SETTINGS_FILE = 'src/content/settings.yml';

export default function (eleventyConfig) {
	eleventyConfig.setInputDirectory('src');
	eleventyConfig.setOutputDirectory('dist');

	eleventyConfig.addGlobalData('settings', () => yaml.load(readFileSync(SETTINGS_FILE, 'utf8')));
	eleventyConfig.addWatchTarget(SETTINGS_FILE);

	// Starter files for new posts/projects, not pages.
	eleventyConfig.ignores.add('src/content/_templates/**');

	// Images referenced from <img> are handled by the image pipeline (config/images.js),
	// so only files used outside of <img> tags are copied as-is.
	eleventyConfig.addPassthroughCopy('src/images/favicon.png');
	eleventyConfig.addPassthroughCopy('src/blog/data');
	eleventyConfig.addPassthroughCopy('src/css');
	eleventyConfig.addPassthroughCopy('src/js');

	eleventyConfig.addLayoutAlias('base', 'layouts/base.njk');
	eleventyConfig.addLayoutAlias('home', 'layouts/home.njk');
	eleventyConfig.addLayoutAlias('blog', 'layouts/blog.njk');
	eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

	// Drafts (`draft: true`) are rendered by `npm start` but skipped entirely in production builds.
	eleventyConfig.addPreprocessor('drafts', '*', (data) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE !== 'serve') {
			return false;
		}
	});

	eleventyConfig.addPlugin(collections);
	eleventyConfig.addPlugin(filters);
	eleventyConfig.addPlugin(images);
	eleventyConfig.addPlugin(shortcodes);
}

export const config = {
	markdownTemplateEngine: 'njk',
	htmlTemplateEngine: 'njk',
};
