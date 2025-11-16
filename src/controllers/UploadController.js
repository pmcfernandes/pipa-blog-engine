import dotenv from 'dotenv'
import { jwt } from 'hono/jwt'
import path from 'node:path';
import fs from 'node:fs';
import { Blog } from '../helpers/models.js'
dotenv.config();

const { HASH_SECRET } = process.env

class UploadController {
  static init(app) {
    const api = app.basePath('/api')

    api.post('/blogs/:blogId/avatar/upload'
      , jwt({ secret: HASH_SECRET })
      , this.uploadHandler)
  }

  static async uploadHandler(c) {
    const blogId = c.req.param('blogId');
    const formData = await c.req.formData()
    const file = formData.get('file')
    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return c.json({ error: 'Blog not found' }, 404);
    }

    const uploadDir = path.join(process.cwd(), 'static', 'avatars');
    try {
      // Ensure upload directory exists
      await fs.promises.mkdir(uploadDir, { recursive: true });

      // Sanitize filename and avoid collisions
      const originalName = path.basename(file.name || `upload-${Date.now()}`);
      const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(uploadDir, safeName);

      // `file` is a Web File/Blob. Use arrayBuffer() for a reliable write.
      const arrayBuffer = await file.arrayBuffer();
      await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));

      blog.avatarUrl = safeName;
      await blog.save();

      return c.json({ message: 'File uploaded successfully', fileUrl: `/static/avatars/${safeName}` }, 201);
    } catch (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'File upload failed' }, 500);
    }
  }
}

export default UploadController




