import dotenv from 'dotenv'
import { jwt } from 'hono/jwt'
import * as z from 'zod'
import BlogUserValidatorMiddleware from '../middlewares/BlogUserValidatorMiddleware.js'
import { zValidator } from '@hono/zod-validator'
import { Navigation } from '../helpers/models.js'
dotenv.config();

const { HASH_SECRET } = process.env

const schema = z.object({
  name: z.string(),
  items: z.number().array(),
})

class NavigationController {
  static init(app) {
    const api = app.basePath('/api')

    api.get('/blogs/:blogId/navigations/:id'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , this.getNavigationHandler)

    api.put('/blogs/:blogId/navigations/:id'
      , jwt({ secret: HASH_SECRET })
      , BlogUserValidatorMiddleware.handle
      , zValidator('json', schema)
      , this.updateNavigationHandler)
  }

  static async getNavigationHandler(c) {
    const { blogId, navigationId: id } = c.req.param();
    const navigation = await Navigation.findByPk(navigationId);
    if (!navigation) {
      return c.json({ error: 'Navigation not found' }, 404);
    }

    if (navigation.blogId.toString() !== blogId) {
      return c.json({ error: 'Navigation does not belong to the specified blog' }, 400);
    }

    const _items = navigation?.items ? navigation?.items.split(',').map((item => parseInt(item))) : [];
    return c.json({
      ...navigation,
      items: _items
    }, 200);
  }

  static async updateNavigationHandler(c) {
    const { blogId, navigationId: id } = c.req.param();
    const updates = c.req.valid('json');

    try {
      const navigation = await Navigation.findByPk(navigationId);
      if (!navigation) {
        return c.json({ error: 'Navigation not found' }, 404);
      }

      if (navigation.blogId.toString() !== blogId) {
        return c.json({ error: 'Navigation does not belong to the specified blog' }, 400);
      }

      const _items = items.join(',');
      await navigation.update({
        ...updates,
        items: _items
      });
      return c.json({ message: 'Navigation updated successfully' }, 200);
    } catch (error) {
      return c.json({
        error: 'Navigation update failed',
        details: error.message
      }, 400)
    }
  }
}

export default NavigationController

