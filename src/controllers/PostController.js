import dotenv from 'dotenv'
import { jwt } from 'hono/jwt'
import * as z from 'zod'
import BlogUserValidatorMiddleware from '../middlewares/BlogUserValidatorMiddleware.js'
import { zValidator } from '@hono/zod-validator'
import { Post } from '../helpers/models.js'
import { slugGenerator } from '../helpers/slugGenerator.js'
dotenv.config();

const { HASH_SECRET } = process.env

const schema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.string().optional(),
  published: z.boolean().optional(),
})

class PostController {
  static init(app) {
    const api = app.basePath('/api')

    api.get('/blogs/:blogId/posts'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.listPostsHandler)

    api.get('/blogs/:blogId/posts/:postId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.getPostHandler)

    api.post('/blogs/:blogId/posts'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , zValidator('json', schema)
      , this.createPostHandler)

    api.put('/blogs/:blogId/posts/:postId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , zValidator('json', schema)
      , this.updatePostHandler)

    api.delete('/blogs/:blogId/posts/:postId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.deletePostHandler)
  }

  static async listPostsHandler(c) {
    const blogId = c.req.param('blogId');
    const posts = await Post.findAll({ where: { blogId } });
    return c.json({ posts }, 200);
  }

  static async getPostHandler(c) {
    const { blogId, postId } = c.req.param();
    const post = await Post.findByPk(postId);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (post.blogId.toString() !== blogId) {
      return c.json({ error: 'Post does not belong to the specified blog' }, 400);
    }

    return c.json(post, 200);
  }

  static async createPostHandler(c) {
    const { title, content, tags, published } = c.req.valid('json')
    const blogId = c.req.param('blogId');
    const slug = await slugGenerator(title, blogId, Post);

    try {
      const status = published ? 'published' : 'draft';
      const newPost = await Post.create({ blogId, slug, title, content, tags, status })
      return c.json({
        message: 'Post created successfully',
        postId: newPost.id
      }, 200)
    } catch (error) {
      return c.json({
        error: 'Post creation failed',
        details: error.message
      }, 400)
    }
  }

  static async updatePostHandler(c) {
    const { blogId, postId } = c.req.param();
    const updates = c.req.valid('json');


    const post = await Post.findByPk(postId);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (post.blogId.toString() !== blogId) {
      return c.json({ error: 'Post does not belong to the specified blog' }, 400);
    }

    const status = updates.published ? 'published' : 'draft';
    try {
      await post.update({ ...updates, status });
      return c.json({ message: 'Post updated successfully' }, 200);
    } catch (error) {
      return c.json({
        error: 'Post update failed',
        details: error.message
      }, 400)
    }
  }

  static async deletePostHandler(c) {
    const { blogId, postId } = c.req.param();
    const post = await Post.findByPk(postId);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (post.blogId.toString() !== blogId) {
      return c.json({ error: 'Post does not belong to the specified blog' }, 400);
    }

    try {
      post.status = 'archived';
      await post.save();
      return c.json({ message: 'Post archived successfully' }, 200);
    } catch (error) {
      return c.json({
        error: 'Post archiving failed',
        details: error.message
      }, 400)
    }
  }
}

export default PostController
