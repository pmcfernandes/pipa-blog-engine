import SubDomainMiddleware from '../middlewares/SubDomainMiddleware.js';
import { getBlogBySubdomain } from '../helpers/blog.js';

class RobotsTxt {
  static init(app) {
    app.use('*', SubDomainMiddleware.handle);
    app.get('/robots.txt', this.robotsHandler);
  }

  static async robotsHandler(c) {
    const blogData = await getBlogBySubdomain(c);
    if (!blogData) {
      return c.text('', 404);
    } else {
      return c.text(`User-agent: *\nAllow: *`, 200);
    }
  }
}

export default RobotsTxt;
