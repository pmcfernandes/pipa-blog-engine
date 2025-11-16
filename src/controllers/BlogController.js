import dotenv from 'dotenv'
import { jwt } from 'hono/jwt'
import * as z from 'zod'
import BlogUserValidatorMiddleware from '../middlewares/BlogUserValidatorMiddleware.js'
import { zValidator } from '@hono/zod-validator'
import { User, Blog, Navigation } from '../helpers/models.js'
dotenv.config();

const { HASH_SECRET } = process.env

const schema = z.object({
  title: z.string(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  subDomain: z.string(),
  timeZone: z.string().optional(),
  dateFormat: z.string().optional(),
  siteFooter: z.string().optional(),
  fontFamily: z.string().optional(),
  theme: z.string().optional(),
  useCustomCSS: z.boolean().optional(),
  customCSS: z.string().optional(),
})

class BlogController {
  static init(app) {
    const api = app.basePath('/api')

    api.get('/blogs/:blogId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.getBlogHandler)

    api.post('/blogs'
      , jwt({ secret: HASH_SECRET })
      , zValidator('json', schema)
      , this.createBlogHandler)

    api.put('/blogs/:blogId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , zValidator('json', schema)
      , this.updateBlogHandler)
  }

  static async getBlogHandler(c) {
    const { blogId } = c.req.param();
    const blog = await Blog.findByPk(blogId);
    if (!blog) return c.json({ error: 'Blog not found' }, 404);
    return c.json(blog, 200);
  }

  static async createBlogHandler(c) {
    const { title, description, subDomain } = c.req.valid('json')
    const username = c.get('jwtPayload').sub;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    try {
      const newBlog = await Blog.create({ title, description, authorId: user.id, subDomain })
      if (newBlog) {
        await Navigation.create({ blogId: newBlog.id, name: 'nav', items: '' })
      }

      return c.json({
        message: 'Blog created successfully',
        blogId: newBlog.id
      }, 200)
    } catch (error) {
      return c.json({
        error: 'Blog creation failed',
        details: error.message
      }, 400)
    }
  }

  static async updateBlogHandler(c) {
    const { blogId } = c.req.param();
    const updates = c.req.valid('json');
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return c.json({ error: 'Blog not found' }, 404);
    }

    try {
      await blog.update(updates);
      return c.json({ message: 'Blog updated successfully', blog }, 200);
    } catch (error) {
      return c.json({ error: 'Blog update failed', details: error.message }, 400);
    }
  }
}

export default BlogController
