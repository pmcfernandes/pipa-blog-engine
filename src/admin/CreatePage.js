import { renderTemplate } from '../helpers/template.js'

class CreatePage {
  static init(app) {
    app.get('/admin/blog/:blogId/create-page', this.createPageHandler);
    app.get('/admin/blog/:blogId/edit-page/:id', this.editPageHandler);
  }

  static async createPageHandler(c) {
    const blogId = c.req.param('blogId');
    return c.html(renderTemplate('admin/create-page', {
      blogId: blogId,
      errorMessage: '',
    }));
  }

  static async editPageHandler(c) {
    const blogId = c.req.param('blogId');
    const pageId = c.req.param('id');

    return c.html(renderTemplate('admin/edit-page', {
      blogId: blogId,
      pageId: pageId,
      errorMessage: '',
    }));
  }
}

export default CreatePage;
