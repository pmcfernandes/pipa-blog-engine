import { User, Blog } from '../helpers/models.js';

class BlogUserValidatorMiddleware {
  static async handle(c, next) {
    const blogId = c.req.param('blogId');
    if (!blogId) {
      return c.json({ error: 'Blog ID is required' }, 400);
    }

    const username = c.get('jwtPayload')?.sub;
    if (!username) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return c.json({ error: 'Blog not found' }, 404);
    }

    if (blog.authorId !== user.id) {
      return c.json({ error: 'Unauthorized access to this blog' }, 403);
    }

    await next();
  }
}

export default BlogUserValidatorMiddleware;

