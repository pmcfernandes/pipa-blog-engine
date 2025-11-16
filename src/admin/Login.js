import dotenv from 'dotenv'
import { sign } from 'hono/jwt'
import { setCookie } from 'hono/cookie'
import { renderTemplate } from '../helpers/template.js'
import { User } from '../helpers/models.js'
import bcrypt from 'bcrypt'
dotenv.config();

const { HASH_SECRET } = process.env

class LoginPage {
  static init(app) {
    app.get('/admin/', this.loginHandler);
    app.get('/admin/login', this.loginHandler);
    app.post('/admin/login', this.loginHandler);
  }

  static async loginHandler(c) {
    switch (c.req.method) {
      case 'POST':
        return LoginPage.postHandler(c);
      default:
        return LoginPage.getHandler(c);
    }
  }

  static async getHandler(c) {
    return c.html(renderTemplate('admin/login', {
      errorMessage: '',
    }));
  }

  static async postHandler(c) {
    const formData = await c.req.formData()
    const username = formData.get('username')
    const password = formData.get('password')
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return c.html(renderTemplate('admin/login', {
        errorMessage: 'User not found.',
      }));
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash)
    if (!passwordMatch) {
      return c.html(renderTemplate('admin/login', {
        errorMessage: 'Invalid username or password.',
      }));
    }

    const token = await sign({
      sub: username,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    }, HASH_SECRET)

    setCookie(c, 'admin_jwt_token', token)
    return c.redirect('/admin/dashboard');
  }
}

export default LoginPage;
