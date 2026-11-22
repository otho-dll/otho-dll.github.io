// Shared settings for every post in this folder, so individual posts don't need to repeat them.
// The URL stays /blog/<file name>/ (e.g. howToIcePi.md -> /blog/howToIcePi/).
export default {
	layout: 'post',
	tags: ['post'],
	permalink: (data) => `/blog/${data.page.fileSlug}/`,
};
