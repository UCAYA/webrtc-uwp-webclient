var express = require('express')

var app = express()

app.use(express.static('dist'))

app.get('/', function (request, response) {
  response.sendFile(`${__dirname}/dist/index.html`)
})

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
