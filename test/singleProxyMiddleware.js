const singleProxy = require('..')
const http = require('http')
const path = require('path')
const request = require('supertest')

describe('singleProxy', function () {
  const server = createServer()

  it('should connect to server2', function (done) {
    request(server)
      .get('/get1')
      .expect(200, 'connect to server2', done)
  })
  it('should connect to server1', function (done) {
    request(server)
      .get('/get2')
      .expect(200, 'connect to server1', done)
  })
})

function createServer () {
  const _singleProxy = singleProxy(path.join(__dirname, 'proxy.conf'))
  const server1 = http.createServer((req, res) => {
    _singleProxy(req, res, (err) => {
      if (err) {
        res.statusCode = 500
        res.end(err.message)
        return
      }
      if (req.url === '/get1') res.end('connect to server1')
      if (req.url === '/get2') res.end('connect to server1')
    })
  }).listen(3000)

  http.createServer((req, res) => {
    if (req.url === '/get1') res.end('connect to server2')
    if (req.url === '/get2') res.end('connect to server2')
  }).listen(3001)
  return server1
}
