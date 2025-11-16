import { renderTemplate } from '../helpers/template.js'

class CreateBlogPage {
  static init(app) {
    app.get('/admin/create-blog', this.createBlogHandler);
  }

  static async createBlogHandler(c) {
    return c.html(renderTemplate('admin/create-blog', {
      errorMessage: '',
    }));
  }
}

export default CreateBlogPage;
