import SubDomainMiddleware from '../middlewares/SubDomainMiddleware.js'
import { getBlogBySubdomain } from '../helpers/blog.js'
import { Blog, Post } from '../helpers/models.js'

class RssPage {
  static init(app) {
    app.use('*', SubDomainMiddleware.handle);
    app.get('/rss', this.rssHandler)
  }

  static async rssHandler(c) {
    const blogData = await getBlogBySubdomain(c);
    if (!blogData) {
      return c.text('Blog not found', 404);
    }

    const posts = await Blog.findByPk(blogData.blogId)
      .then(blog => blog.getPosts({ where: { status: 'published' }, order: [['createdAt', 'DESC']] }));

    const rssItems = posts.map(post => `
      <item>
        <title>${post.title}</title>
        <link>https://${blogData.subdomain}.${process.env.MAIN_DOMAIN}/posts/${post.slug}</link>
        <description><![CDATA[${post.content}]]></description>
        <pubDate>${post.createdAt.toUTCString()}</pubDate>
        <guid>https://${blogData.subdomain}.${process.env.MAIN_DOMAIN}/posts/${post.slug}</guid>
      </item>
    `).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>${blogData.blogTitle}</title>
          <link>https://${blogData.subdomain}.${process.env.MAIN_DOMAIN}</link>
          <description>${blogData.blogDescription}</description>
          ${rssItems}
        </channel>
      </rss>
    `;

    c.header('Content-Type', 'application/rss+xml');
    return c.text(rssFeed, 200);
  }
}

export default RssPage;
