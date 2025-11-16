import { renderTemplate } from '../helpers/template.js'

class RegisterPage {
  static init(app) {
    app.get('/admin/register', this.registerHandler);
  }

  static async registerHandler(c) {
    return c.html(renderTemplate('admin/register', {
      errorMessage: '',
    }));
  }
}

export default RegisterPage;
