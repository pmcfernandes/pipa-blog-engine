import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { User } from '../helpers/models.js'
import { Op } from 'sequelize'

const schema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
})

class RegisterController {
  static init(app) {
    const api = app.basePath('/api')

    api.post('/register'
      , zValidator('json', schema)
      , this.registerHandler)
  }

  static async registerHandler(c) {
    const { username, password, email } = c.req.valid('json')

    const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } })
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400)
    }

    try {
      const newUser = await User.create({ username, email, passwordHash: password })
      return c.json({
        message: 'Registration successful',
        userId: newUser.id
      }, 200)
    } catch (error) {
      return c.json({
        error: 'Registration failed',
        details: error.message
      }, 400)
    }
  }
}

export default RegisterController
