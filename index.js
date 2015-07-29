var app = require('koa')()

var port = process.env.PORT || 5000

app
  .use(function*() {
    this.response.status = 302
    this.redirect('http://hollyquintet.tomaketheendofbattle.com')
  })
  .listen(port, function() {
    console.log('Koa is listening to port ' + port + '...')
  })
