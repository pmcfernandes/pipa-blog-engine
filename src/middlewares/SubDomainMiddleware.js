class SubDomainMiddleware {
  static async handle(c, next) {
    console.log(`Received request for ${c.req.url}`);
    const host = c.req.header('host') || '';
    if (host.includes('localhost')) {
      c.set('subdomain', 'pmcfernandes.github.com'); // For local testing purposes
    } else {
      c.set('subdomain', host)
    }

    await next();
  }
}

export default SubDomainMiddleware
