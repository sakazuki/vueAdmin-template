'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin"',
  Region: '"ap-northeast-1"',
  UserPoolId: 'ap-northeast-1_XXXXXXXXX',
  ClientId: 'YYYYYYYYYYYYYYYYYYYYYYYYYY',
  IdentityPoolId: 'ap-northeast-1:XXXXXXXX-YYYY-XXXX-YYYY-XXXXXXXXXXXX'
})
