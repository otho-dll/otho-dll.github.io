export default function collections(eleventyConfig) {
	// Blog posts grouped by year, newest first.
	// Each post gets a `side` used for the zig-zag layout on the blog index:
	// a lone post in its year is centered, otherwise posts alternate left/right.
	eleventyConfig.addCollection('postsByYear', (api) => {
		const posts = api.getFilteredByTag('post').reverse();
		const years = new Map();

		for (const post of posts) {
			const year = post.date.getFullYear();
			if (!years.has(year)) years.set(year, []);
			years.get(year).push(post);
		}

		return [...years].map(([year, yearPosts]) => ({
			year,
			posts: yearPosts.map((post, i) => ({
				post,
				side: yearPosts.length === 1 ? 'center' : i % 2 === 0 ? 'left' : 'right',
			})),
		}));
	});
}
