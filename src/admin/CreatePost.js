import { renderTemplate } from '../helpers/template.js'

class CreatePostPage {
  static init(app) {
    app.get('/admin/blog/:blogId/create-post', this.createPostHandler);
    app.get('/admin/blog/:blogId/edit-post/:id', this.editPostHandler);
  }

  static async createPostHandler(c) {
    const blogId = c.req.param('blogId');
    return c.html(renderTemplate('admin/create-post', {
      blogId: blogId,
      errorMessage: '',
    }));
  }

  static async editPostHandler(c) {
    const blogId = c.req.param('blogId');
    const postId = c.req.param('id');
    return c.html(renderTemplate('admin/edit-post', {
      blogId: blogId,
      postId: postId,
      errorMessage: '',
    }));
  }
}

export default CreatePostPage;
