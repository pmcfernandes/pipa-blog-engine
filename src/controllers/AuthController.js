import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { User } from '../helpers/models.js'
import bcrypt from 'bcrypt'
import { sign } from 'hono/jwt'
import dotenv from 'dotenv'
dotenv.config();

const { HASH_SECRET } = process.env

const schema = z.object({
  username: z.string(),
  password: z.string(),
})

class AuthController {
  static init(app) {
    const api = app.basePath('/api')

    api.post('/auth'
      , zValidator('json', schema)
      , this.authHandler)
  }

  static async authHandler(c) {
    const { username, password } = c.req.valid('json')
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return c.json({
        error: 'Invalid username or password'
      }, 401)
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash)
    if (!passwordMatch) {
      return c.json({
        error: 'Invalid username or password'
      }, 401)
    }

    const token = await sign({
      sub: username,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    }, HASH_SECRET)

    return c.json({
      message: 'Authentication successful',
      token,
    }, 200)
  }
}

export default AuthController
