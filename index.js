const jayson = require('jayson')
const config = require('./config')

const jsonParser = require('body-parser').json
const connect = require('connect')
const app = connect()

const methods = require('./app/controller')

const server = jayson.server(methods)

app.use(jsonParser())
app.use(server.middleware())

const port = config.port || 10002
app.listen(port, () => {
  console.log('rpc server start at port: ', port)
});