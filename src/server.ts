import http from 'http'
import getPort from 'get-port'
import app from '.'

const server = http.createServer(app)

async function launchServer () {
  const port = await getPort({
    port: parseInt(process.env.HOLLY_QUINTET_PORT || process.env.npm_package_config_port!, 10)
  })

  server.listen(port)
    .on('listening', () => {
      const addr = server.address()!
      const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
      console.log(`Listening on ${bind}`)
    })
}

launchServer()

export default server
