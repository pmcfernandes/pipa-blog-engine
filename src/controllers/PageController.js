import dotenv from 'dotenv'
import { jwt } from 'hono/jwt'
import * as z from 'zod'
import BlogUserValidatorMiddleware from '../middlewares/BlogUserValidatorMiddleware.js'
import { zValidator } from '@hono/zod-validator'
import { Page } from '../helpers/models.js'
import { slugGenerator } from '../helpers/slugGenerator.js'
dotenv.config();

const { HASH_SECRET } = process.env

const schema = z.object({
  title: z.string(),
  body: z.string(),
})

class PageController {
  static init(app) {
    const api = app.basePath('/api')

    api.get('/blogs/:blogId/pages'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.listPagesHandler)

    api.get('/blogs/:blogId/pages/:pageId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.getPageHandler)

    api.post('/blogs/:blogId/pages'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , zValidator('json', schema)
      , this.createPageHandler)

    api.put('/blogs/:blogId/pages/:pageId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , zValidator('json', schema)
      , this.updatePageHandler)

    api.delete('/blogs/:blogId/pages/:pageId'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.deletePageHandler)
  }

  static async listPagesHandler(c) {
    const blogId = c.req.param('blogId');
    const pages = await Page.findAll({ where: { blogId } });
    return c.json({ pages }, 200);
  }

  static async getPageHandler(c) {
    const { blogId, pageId } = c.req.param();
    const page = await Page.findByPk(pageId);
    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }

    if (page.blogId.toString() !== blogId) {
      return c.json({ error: 'Page does not belong to the specified blog' }, 400);
    }

    return c.json(page, 200);
  }

  static async createPageHandler(c) {
    const { title, body } = c.req.valid('json')
    const blogId = c.req.param('blogId');
    const slug = await slugGenerator(title, blogId, Page);

    try {
      const newPage = await Page.create({ blogId, slug, title, body })
      return c.json({
        message: 'Page created successfully',
        pageId: newPage.id
      }, 200)
    } catch (error) {
      return c.json({
        error: 'Page creation failed',
        details: error.message
      }, 400)
    }
  }

  static async updatePageHandler(c) {
    const { blogId, pageId } = c.req.param();
    const updates = c.req.valid('json');

    try {
      const page = await Page.findByPk(pageId);
      if (!page) {
        return c.json({ error: 'Page not found' }, 404);
      }

      if (page.blogId.toString() !== blogId) {
        return c.json({ error: 'Page does not belong to the specified blog' }, 400);
      }

      await page.update(updates);
      return c.json({ message: 'Page updated successfully' }, 200);
    } catch (error) {
      return c.json({
        error: 'Page update failed',
        details: error.message
      }, 400)
    }
  }

  static async deletePageHandler(c) {
    const { blogId, pageId } = c.req.param();
    const page = await Page.findByPk(pageId);
    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }

    if (page.blogId.toString() !== blogId) {
      return c.json({ error: 'Page does not belong to the specified blog' }, 400);
    }

    try {
      await page.destroy();
      return c.json({ message: 'Page deleted successfully' }, 200);
    } catch (error) {
      return c.json({
        error: 'Page deletion failed',
        details: error.message
      }, 400)
    }
  }
}

export default PageController
