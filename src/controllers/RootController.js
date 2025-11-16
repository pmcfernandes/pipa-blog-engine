class RootController {
  static init(app) {
    const api = app.basePath('/api')
    api.get('/', this.rootHandler)
  }

  static rootHandler(c) {
    return c.text('It works!')
  }
}

export default RootController
