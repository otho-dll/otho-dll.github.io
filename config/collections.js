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

	// "Lab log": posts and projects on one timeline, newest first, grouped by year.
	// Projects only get a place on the timeline when their front matter has a `date:`;
	// the rest are returned separately as `undated`.
	eleventyConfig.addCollection('labLog', (api) => {
		const posts = api
			.getFilteredByTag('post')
			.filter((item) => !item.data.draft)
			.map((item) => ({ type: 'post', item, date: item.date }));
		const projects = api.getFilteredByTag('project');
		const datedProjects = projects
			.filter((item) => item.data.date)
			.map((item) => ({ type: 'project', item, date: new Date(item.data.date) }));

		const entries = [...posts, ...datedProjects].sort((a, b) => b.date - a.date);
		const years = new Map();
		for (const entry of entries) {
			const year = entry.date.getFullYear();
			if (!years.has(year)) years.set(year, []);
			years.get(year).push(entry);
		}

		return {
			years: [...years].map(([year, yearEntries]) => ({ year, entries: yearEntries })),
			undated: projects.filter((item) => !item.data.date),
		};
	});
}
