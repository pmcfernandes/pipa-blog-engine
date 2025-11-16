import path from 'node:path';
import SubDomainMiddleware from '../middlewares/SubDomainMiddleware.js';
import { getBlogBySubdomain } from '../helpers/blog.js';
import pngToIco from 'png-to-ico';

class FavIcon {
  static init(app) {
    app.use('*', SubDomainMiddleware.handle);
    app.get('/favicon.ico', this.favIconHandler);
  }

  static async favIconHandler(c) {
    const blogData = await getBlogBySubdomain(c);
    if (!blogData || !blogData.avatarURL) {
      return c.text('', 404);
    }

    const pathToPng = path.join(process.cwd(), 'static', 'avatars', blogData.avatarURL);
    const icoBuffer = await pngToIco(pathToPng);
    return c.body(icoBuffer, 200, {
      'Content-Type': 'image/x-icon',
    });
  }
}

export default FavIcon;


