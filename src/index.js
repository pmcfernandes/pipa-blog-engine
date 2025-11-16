import dotenv from 'dotenv'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { sequelize } from './helpers/db.js'
import { initModels } from './helpers/models.js'
import RootController from './controllers/RootController.js'
import AuthController from './controllers/AuthController.js'
import RegisterController from './controllers/RegisterController.js'
import BlogController from './controllers/BlogController.js'
import UploadController from './controllers/UploadController.js'
import PostController from './controllers/PostController.js'
import PageController from './controllers/PageController.js'
import NavigationController from './controllers/NavigationController.js'
import LoginPage from './admin/Login.js'
import RegisterPage from './admin/Register.js'
import DashboardPage from './admin/Dashboard.js'
import CreateBlogPage from './admin/CreateBlog.js'
import CreatePostPage from './admin/CreatePost.js'
import CreatePage from './admin/CreatePage.js'
import RssPage from './pages/Rss.js'
import BlogPage from './pages/BlogIndex.js'
import PostPage from './pages/Post.js'
import PagePage from './pages/Page.js'
import RobotsTxt from './pages/Robots.js'
import FavIcon from './pages/FavIcon.js'

// Load environment variables
dotenv.config();

initModels(sequelize);
sequelize.sync({ force: false })
  .then(() => {
    console.log("Database & tables created!");
  })

const app = new Hono()
app.use(logger())
app.use(prettyJSON())
app.use('/static/*', serveStatic({ root: "./" }))
app.use('/api/*', cors())

// Initialize api controllers
RootController.init(app)
AuthController.init(app)
RegisterController.init(app)
BlogController.init(app)
UploadController.init(app)
PostController.init(app)
PageController.init(app)
NavigationController.init(app)

// Initialize admin routes
LoginPage.init(app)
RegisterPage.init(app)
DashboardPage.init(app)
CreateBlogPage.init(app)
CreatePostPage.init(app)
CreatePage.init(app)

// Initialize BlogPage routes
BlogPage.init(app)
FavIcon.init(app)
RobotsTxt.init(app)
RssPage.init(app)
PostPage.init(app)
PagePage.init(app)

serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
