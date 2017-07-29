'use strict'

const fetch = require('../src/fetch')

describe('Fetch test', () => {
  it('should login and fetch all account information', () => {
    const result = fetch('1233', '123456')
    console.log(JSON.stringify(result, null, 4))
  })
})
