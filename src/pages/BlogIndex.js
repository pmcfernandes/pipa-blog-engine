import { format } from 'date-fns'
import SubDomainMiddleware from '../middlewares/SubDomainMiddleware.js'
import { renderTemplate } from '../helpers/template.js'
import { getBlogBySubdomain } from '../helpers/blog.js'
import { Blog } from '../helpers/models.js'

class BlogPage {
  static init(app) {
    app.use('*', SubDomainMiddleware.handle);
    app.get('/', this.indexHandler)
  }

  static async indexHandler(c) {
    const blogData = await getBlogBySubdomain(c);
    if (!blogData) {
      return c.text('Blog not found', 404);
    }

    const posts = await Blog.findByPk(blogData.blogId)
      .then(blog => blog.getPosts({ where: { status: 'published' }, order: [['createdAt', 'DESC']] }));

    return c.html(renderTemplate('blogs/index', {
      ...blogData,
      posts: posts.map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: (post.content || '').substring(0, 200) + '...',
        content: post.content,
        tags: (post.tags || '').split(',').map(tag => tag.trim()),
        createdAt: format(post.createdAt, blogData.dateFormat),
      })),
    }));
  }
}

export default BlogPage;
