var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  pageSettings: {
    userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
  },
  viewportSize: {
    width: 1920,
    height: 1080
  }
})

const stepCount = {}

function clickPassword (password) {
  var self = this
  self.log('password is ' + password)
  for (var i = 0; i < password.length; i++) {
    var digitSelector = '#secret-nbr-keyboard > a[data-value="' + password[i] + '"]'
    self.log('clicking ' + digitSelector)
    self.click(digitSelector)
  }
}

var takeScreenshot = function (suffix) {
  var title = this.getTitle()
  stepCount[title] = stepCount[title] || 0
  stepCount[title]++
  var screenshotPath = 'screenshots/' + title + ' ' + stepCount[title]
  if (typeof suffix === 'string') screenshotPath += ' ' + suffix
  casper.capture(screenshotPath + '.png')
}
casper
    .start('https://mabanque.bnpparibas/sitedemo/ident.html', function () {
      casper.log('in the ident page')
    })
    .then(takeScreenshot)
    .then(function () {
        // fill doesn't work
        // this.fillXPath('form[name="logincanalnet"]', {
        //     '//*[@id="client-nbr"]': '123'
        // }, false)

      this.sendKeys('form[name="logincanalnet"] > #client-nbr', '123')
    })
    .then(takeScreenshot)
    .then(function () {
      var password = '123456'
      this.log('clicking password')
      clickPassword.call(this, password)
    })
    .then(takeScreenshot)
    .then(function () {
      this.click('#submitIdent')
    })
    .then(function () {
      this.waitForResource('udc-vue-liste.html', function () {
            // begin parsing json
        this.log('beging parsing')
      }, function () {
        this.log('no account list', 'error')
        takeScreenshot.call(this, 'error no account list')
      }, 10000)
    })
    // .then(function () {
    //     this.waitUntilVisible('section.liste-famille-compte > header.udc-ligne-titre', function () {
    //         // begin parsing json
    //         this.log('beging parsing')
    //     }, function () {
    //         this.log('no account list', 'error')
    //         takeScreenshot.call(this, 'error no account list')
    //     }, 10000)
    // })
    // .then(function () {
    //   this.waitFor(function () {
    //     return this.evaluate(function () {
    //       return document.querySelectorAll('section.liste-famille-compte > ul.udc-liquidite').length > 0
    //     })
    //   }, function () {
    //         // begin parsing json
    //   }, function () {
    //     this.log('no account list', 'error')
    //     takeScreenshot.call(this, 'error no account list')
    //   }, 10000)
    // })
    .then(takeScreenshot)

casper.run()
