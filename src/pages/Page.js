import SubDomainMiddleware from '../middlewares/SubDomainMiddleware.js'
import { renderTemplate } from '../helpers/template.js'
import { getBlogBySubdomain } from '../helpers/blog.js'
import { Page } from '../helpers/models.js';

class PagePage {
  static init(app) {
    app.use('*', SubDomainMiddleware.handle);
    app.get('/:slug', this.pageHandler)
  }

  static async pageHandler(c) {
    const slug = c.req.param('slug');
    const blogData = await getBlogBySubdomain(c);
    if (!blogData) {
      return c.text('Blog not found', 404);
    }

    const page = await Page.findOne({
      where: { slug, blogId: blogData.blogId }
    });

    if (!page) {
      return c.text('Page not found', 404);
    }

    return c.html(renderTemplate('blogs/page', {
      ...blogData,
      page: {
        slug: page.slug,
        title: page.title,
        body: page.body,
      }
    }));
  }
}

export default PagePage;
