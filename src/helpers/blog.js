import { raw } from 'hono/html';
import { Blog, Page, Navigation } from './models.js';

async function getBlogBySubdomain(c) {
  const subdomain = c.get('subdomain');
  const blog = await Blog.findOne({ where: { subDomain: subdomain } });
  if (!blog) {
    return null;
  }

  let navigationItems = [];
  const navigation = await Navigation.findOne({ where: { blogId: blog.id } });
  if (navigation) {
    if (navigation.items != '') {
      navigationItems = (navigation?.items || '').split(',').map(async item => {
        const page = await Page.findOne({ where: { id: item } });
        return {
          label: page ? page.title : 'Untitled',
          url: page ? `/${page.slug}` : '#',
        };
      });
    }
  }

  return {
    blogId: blog.id,
    blogTitle: blog.title,
    blogDescription: blog.description,
    avatarURL: blog.avatarUrl || '',
    footerText: blog.siteFooter || '',
    customCSS: blog.useCustomCSS ? `
      <style type="text/css">
        ${blog.customCSS}
      </style>`: '',
    theme: blog.theme || 'default',
    fontFamily: blog.fontFamily || 'Arial, sans-serif',
    timeZone: blog.timeZone || 'UTC',
    dateFormat: blog.dateFormat || 'yyyy-MM-dd',
    replyToEmail: blog.replyToEmail || '',
    navigationItems: await Promise.all(navigationItems),
  }
}

export { getBlogBySubdomain };
