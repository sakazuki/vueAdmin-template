// import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import Cognito from '@/utils/cognito/cognito.js'

const cognito = new Cognito()
cognito.configure(process.env)

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // log in
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        console.log(userInfo.password, cognito)
        cognito.login(username, userInfo.password).then(response => {
          console.log(response)
          console.log(response.getIdToken().payload)
          setToken(response.getIdToken().payload)
          commit('SET_TOKEN', response.getIdToken().payload)
          resolve()
        }).catch(error => {
          console.log(error)
          reject(error)
        })
      })
    },
    Signup({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        if (username && (userInfo.password === userInfo.passwordConfirm)) {
          cognito.singUp(username, userInfo.password).then(response => {
            resolve()
          }).catch(error => {
            reject(error)
          })
        }
      })
    },
    Confirm({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        if (username && (userInfo.password === userInfo.passwordConfirm)) {
          cognito.confirmation(username, userInfo.confirmationCode).then(response => {
            resolve()
          }).catch(error => {
            reject(error)
          })
        }
      })
    },
    // Get user information
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        const response = JSON.parse(getToken())
        if (response['cognito:groups'] && response['cognito:groups'].length > 0) { // Verify that the returned roles are a non-null array
          commit('SET_ROLES', response['cognito:groups'])
        } else {
          reject('getInfo: roles must be a non-null array !')
        }
        commit('SET_NAME', response.email)
        commit('SET_AVATAR', response.avatar)
        resolve(response)
      })
    },

    // logout
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        cognito.logout()
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resolve()
      })
    },

    // Front End
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
