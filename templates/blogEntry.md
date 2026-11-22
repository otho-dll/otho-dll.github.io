---
# Copy to src/blog/<slug>.md
layout: post
tags: ["post"]
title: "TITLE"
date: "YYYY-MM-DD"
description: "Short description, shown on the blog list and in link previews"
image: "/images/blog/<slug>/cover.jpg"   # card + social preview image
hide_image: false                        # true = don't show the image at the top of the post
article_tags: ["Tag", "Another"]
draft: true                              # visible with `npm start`, not published until removed
# gallery:                               # optional gallery at the end of the post
#   - "/images/blog/<slug>/1.jpg"
#   - "/images/blog/<slug>/2.jpg"
---

Post content in Markdown. Images: ![Describe the image](/images/blog/<slug>/photo.jpg)

Embeds:
{% raw %}
{% gallery ["/images/blog/<slug>/1.png", "/images/blog/<slug>/2.png"] %}
{% githubCard "otho-dll/repo-name" %}
{% printablesCard "https://www.printables.com/model/…", "Title", "Optional description" %}
{% pdfEmbed "/blog/data/file.pdf", "Title" %}
{% endraw %}
