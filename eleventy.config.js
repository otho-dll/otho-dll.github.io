export default function (eleventyConfig) {
	eleventyConfig.setInputDirectory('src');
	eleventyConfig.setOutputDirectory('dist');

	eleventyConfig.addPassthroughCopy('src/images');
	eleventyConfig.addPassthroughCopy('src/blog/data');
	eleventyConfig.addPassthroughCopy('src/css');
	eleventyConfig.addPassthroughCopy('src/js');

	// Drafts (`draft: true`) are rendered by `npm start` but skipped entirely in production builds.
	eleventyConfig.addPreprocessor('drafts', '*', (data) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE !== 'serve') {
			return false;
		}
	});
}

export const config = {
	markdownTemplateEngine: 'njk',
	htmlTemplateEngine: 'njk',
};
