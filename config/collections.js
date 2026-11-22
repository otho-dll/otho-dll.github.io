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

	// "Lab log" on the home page: posts and projects on one timeline, newest first, grouped by year.
	//
	// Entry shape: { type: 'post' | 'project', item, post?, date }
	// - A project whose `link` points to a blog post absorbs that post: one entry with `post` set,
	//   and the post isn't listed on its own. Its date is the project's `date:`, else the post's.
	// - Other projects need a `date:` in their front matter; without one they're returned as `undated`.
	eleventyConfig.addCollection('labLog', (api) => {
		const posts = api.getFilteredByTag('post').filter((item) => !item.data.draft);
		const postsByUrl = new Map(posts.map((post) => [post.url, post]));
		const projects = api.getFilteredByTag('project');

		const absorbedPosts = new Set();
		const projectEntries = [];
		const undated = [];

		for (const project of projects) {
			const post = postsByUrl.get(project.data.link);
			if (post) absorbedPosts.add(post);

			const date = project.data.date ? new Date(project.data.date) : post?.date;
			if (date) projectEntries.push({ type: 'project', item: project, post, date });
			else undated.push(project);
		}

		const postEntries = posts
			.filter((post) => !absorbedPosts.has(post))
			.map((post) => ({ type: 'post', item: post, date: post.date }));

		const entries = [...postEntries, ...projectEntries].sort((a, b) => b.date - a.date);
		const years = new Map();
		for (const entry of entries) {
			const year = entry.date.getFullYear();
			if (!years.has(year)) years.set(year, []);
			years.get(year).push(entry);
		}

		return {
			years: [...years].map(([year, yearEntries]) => ({ year, entries: yearEntries })),
			undated,
		};
	});
}
