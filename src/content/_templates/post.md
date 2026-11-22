---
# New post: copy this file to src/content/posts/<name>.md
# The post's address will be /blog/<name>/ (the file name without .md).
title: "TITLE"
date: "YYYY-MM-DD"
description: "Short description, shown in the Maker log and in link previews"
image: "/images/blog/<name>/cover.jpg"   # Maker log thumbnail + link preview image
hide_image: false                        # true = don't show the image at the top of the post
article_tags: ["Tag", "Another"]         # shown as tags in the Maker log
draft: true                              # visible with `npm start`, not published until removed
# gallery:                               # optional gallery at the end of the post
#   - "/images/blog/<name>/1.jpg"
#   - "/images/blog/<name>/2.jpg"
---

Post content in Markdown. Images: ![Describe the image](/images/blog/<name>/photo.jpg)

Embeds:
{% raw %}
{% gallery ["/images/blog/<name>/1.png", "/images/blog/<name>/2.png"] %}
{% githubCard "otho-dll/repo-name" %}
{% printablesCard "https://www.printables.com/model/…", "Title", "Optional description" %}
{% pdfEmbed "/blog/data/file.pdf", "Title" %}
{% endraw %}
