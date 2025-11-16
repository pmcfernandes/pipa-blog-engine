import dotenv from 'dotenv'
import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { renderTemplate } from '../helpers/template.js'
import { User, Blog } from '../helpers/models.js'
dotenv.config();

const { HASH_SECRET } = process.env

class DashboardPage {
  static init(app) {
    app.get('/admin/dashboard', this.dashboardHandler);
  }

  static async dashboardHandler(c) {
    const jwt = getCookie(c, 'admin_jwt_token');
    const jwtPayload = await verify(jwt, HASH_SECRET);
    if (!jwtPayload) {
      return c.redirect('/admin/login');
    }

    const username = jwtPayload.sub;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return c.redirect('/admin/login');
    }

    const blogs = await Blog.findAll({ where: { authorId: user.id } });
    if (!blogs || blogs.length === 0) {
      return c.redirect('/admin/create-blog');
    }

    return c.html(renderTemplate('admin/dashboard', {
      username,
      blogId: blogs.map(blog => blog.id).shift(),
      errorMessage: '',
    }));
  }
}

export default DashboardPage;
