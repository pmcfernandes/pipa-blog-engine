import { format } from 'date-fns'
import SubDomainMiddleware from '../middlewares/SubDomainMiddleware.js'
import { renderTemplate } from '../helpers/template.js'
import { getBlogBySubdomain } from '../helpers/blog.js'
import {  Post } from '../helpers/models.js'

class PostPage {
  static init(app) {
    app.use('*', SubDomainMiddleware.handle);
    app.get('/posts/:slug', this.postHandler)
  }

  static async postHandler(c) {
    const slug = c.req.param('slug');
    const blogData = await getBlogBySubdomain(c);
    if (!blogData) {
      return c.text('Blog not found', 404);
    }

    const post = await Post.findOne({
      where: { slug, status: 'published', blogId: blogData.blogId }
    });

    if (!post) {
      return c.text('Post not found', 404);
    }

    return c.html(renderTemplate('blogs/post', {
      ...blogData,
      post: {
        slug: post.slug,
        title: post.title,
        content: post.content,
        tags: (post.tags || '').split(',').map(tag => tag.trim()),
        createdAt: format(post.createdAt, blogData.dateFormat),
      }
    }));
  }

}

export default PostPage;


