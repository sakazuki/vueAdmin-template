// Refs https://qiita.com/daikiojm/items/b02c19cfea6766c308ca
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js'
import { Config, CognitoIdentityCredentials } from 'aws-sdk'

export default class Cognito {
  configure(config) {
    if (config.userPool) {
      this.userPool = config.userPool
    } else {
      this.userPool = new CognitoUserPool({
        UserPoolId: config.UserPoolId,
        ClientId: config.ClientId
      })
    }
    Config.region = config.region
    Config.credentials = new CognitoIdentityCredentials({
      IdentityPoolId: config.IdentityPoolId
    })
    this.options = config
  }

  static install = (Vue, options) => {
    Object.defineProperty(Vue.prototype, '$cognito', {
      get() { return this.$root._cognito }
    })

    Vue.mixin({
      beforeCreate() {
        if (this.$options.cognito) {
          this._cognito = this.$options.cognito
          this._cognito.configure(options)
        }
      }
    })
  }

  /**
   * singUp with username, password
   * set email into UserAttribute as username
   */
  signUp(username, password) {
    const dataEmail = { Name: 'email', Value: username }
    const attributeList = []
    attributeList.push(new CognitoUserAttribute(dataEmail))
    return new Promise((resolve, reject) => {
      console.log(this.userPool)
      this.userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * enable user with a confirmation code
   */
  confirmation(username, confirmationCode) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * login with username, password
   */
  login(username, password) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    const authenticationData = { Username: username, Password: password }
    const authenticationDetails = new AuthenticationDetails(authenticationData)
    return new Promise((resolve, reject) => {
      const authConfig = {
        onSuccess: (result) => {
          resolve(result)
        },
        onFailure: (err) => {
          reject(err)
        },
        // refs https://qiita.com/shinichi-takahashi/items/bbfa7d505c45e2986f91
        newPasswordRequired(userAttributes, requiredAttributes) {
          console.log('newPasswordRequired()')
          console.log(userAttributes, requiredAttributes)
          reject("NEW_PASSWORD_REQUIRED")
          // cognitoUser.completeNewPasswordChallenge(password, {}, authConfig)
        }
      }
      cognitoUser.authenticateUser(authenticationDetails, authConfig)
    })
  }

  /**
   * FORCE_CHANGE_PASSWORD
   */
  forceChangePassword (username, password, newpassword) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    const authenticationData = { Username: username, Password: password }
    const authenticationDetails = new AuthenticationDetails(authenticationData)
    console.log(authenticationDetails)
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        newPasswordRequired: function (userAttributes, requiredAttributes) {
          cognitoUser.completeNewPasswordChallenge(newpassword, null, {
            onFailure: function (err) {
              reject(err)
            },
            onSuccess: function (result) {
              resolve(result)
            }
          })
        }
      })
    })
  }

  /**
   * Password Reset
   */
  confirmPassword (username, password, confirmationCode) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    const authenticationData = { Username: username, Password: password }
    const authenticationDetails = new AuthenticationDetails(authenticationData)
    console.log(authenticationDetails)
    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(confirmationCode, password, {
        onFailure (err) {
          console.log(err)
        },
        onSuccess () {
          console.log('Success')
          resolve()
        }
      })
    })
  }

  /*
   * Resend Confirmation Code
   */
  sendKey (username) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode(function (err, result) {
        if (err) {
          console.log(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /*
   * Forgot Password
   */
  forgotPassword (username) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: function (result) {
          console.log('call result: ' + result)
          resolve(result)
        },
        onFailure: function (err) {
          console.log(err)
        }
      })
    })
  }

  /**
   * logout
   */
  logout() {
    this.userPool.getCurrentUser().signOut()
  }

  /**
   * check login
   */
  isAuthenticated() {
    const cognitoUser = this.userPool.getCurrentUser()
    return new Promise((resolve, reject) => {
      if (cognitoUser === null) { reject(cognitoUser) }
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err)
        } else {
          if (!session.isValid()) {
            reject(session)
          } else {
            resolve(cognitoUser)
          }
        }
      })
    })
  }

  getInfo() {
    return new Promise((resolve, reject) => {
      this.isAuthenticated().then(cognitoUser => {
        // console.log('#### getInfo', cognitoUser)
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.log(err, cognitoUser)
            reject(err)
          } else {
            resolve(attributes)
          }
        })
      }).catch(error => {
        reject(error)
      })
    })
  }
}
