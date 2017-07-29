var casper = require('casper').create()

module.exports = function (username, password) {
  casper.then(function () {
    this.echo('First Page: ' + this.getTitle())
  })

  casper
    .thenOpen('http://phantomjs.org', function () {
      this.echo('Second Page: ' + this.getTitle())
    })
    .then(function () {
      casper.capture('screenshots/phantomjs.png')
    })

  casper.run()
}
