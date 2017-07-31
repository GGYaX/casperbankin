var casper = require('casper').create({
    verbose: true,
    logLevel: 'info',
    pageSettings: {
        userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
    },
    viewportSize: {
        width: 1920,
        height: 1080
    }
})

var stepCount = {}
var resultJSON

function clickPassword(password) {
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
            this.page.switchToChildFrame(0) // this allow to switch to the ifram that contains the account info
            resultJSON = this.evaluate(function () {
                function parseMoney(string) {
                    // string is like
                    var money = {}
                    // phantomjs has bug for replace /\./, need to use split
                    string = string.replace(/ /g, '').split('.').join('').replace(/,/, '.')
                    money.unit = string[string.length - 1]
                    money.value = parseFloat(string.split(money.unit)[0])

                    return money
                }

                function isHidden(el) {
                    var style = window.getComputedStyle(el)
                    return (style.display === 'none')
                }

                __utils__.log('------------------------------------------------')
                try {
                    // var accountSection = document.querySelectorAll('section.liste-famille-compte > ul.list-vue1');
                    // __utils__.log(accountSection.innerHTML)
                    var accountFamily = document.querySelectorAll('section.liste-famille-compte > ul.list-vue1 > li')
                    var accountInfoArray = []
                    for (var i = 0; i < accountFamily.length; i++) {
                        var accountElement = accountFamily[i]
                        if (!isHidden(accountElement)) {
                            __utils__.log('++++++++++++++++++++++++++++')
                            var accountName = accountElement.querySelector('div.infos-compte').querySelector('.js-goto-rop').textContent.trim()
                            var accountNumber = accountElement.querySelector('div.infos-compte').textContent.trim().replace(/ /g, '').replace(/\n+/g, '\n').split('\n')[1]
                            // solde
                            var soldeElement = accountElement.querySelector('.udc-solde')
                            var solde
                            if (soldeElement) {
                                var soldeString = soldeElement.textContent.trim()
                                __utils__.log(soldeString)
                                solde = parseMoney(soldeString)
                            }
                            // a venir
                            var aVenirElement = accountElement.querySelector('.a-venir') || accountElement.querySelector('.en-cours')
                            var aVenirSolde
                            if (aVenirElement) {
                                var aVenirString = aVenirElement.textContent.trim().split(':')[1]
                                aVenirSolde = parseMoney(aVenirString)
                                __utils__.log('aVenirSolde ' + JSON.stringify(aVenirSolde, null, 2))
                            }
                            var accountInfo = {
                                '1_accountName': accountName,
                                '2_accountNumber': accountNumber,
                                '3_solde': solde,
                                '4_aVenir': aVenirSolde
                            }
                            __utils__.log('------')
                            __utils__.log('accountInfo ' +
                                JSON.stringify(accountInfo, null, 2))
                            accountInfoArray.push(accountInfo)
                        }
                    }
                    return accountInfoArray
                } catch (err) {
                    __utils__.log('error !\n' + err, 'error')
                }
            })
            this.log('array is \n' + JSON.stringify(resultJSON, null, 2))
        }, function () {
            this.log('no account list', 'error')
            takeScreenshot.call(this, 'error no account list')
        }, 10000)
    })
    .then(takeScreenshot)

casper.run(function () {
    console.log('account are: \n' + JSON.stringify(resultJSON, null, 2))
    this.exit()
})
