import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress bar
import 'nprogress/nprogress.css'// Progress bar style
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // Auth

const whiteList = ['/login', '/signup', '/confirm', '/changepassword', '/passwordreset', '/sendkey', '/forgotpassword'] // Do not redirect whitelist
router.beforeEach((to, from, next) => {
  NProgress.start()
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // Get user information
          // console.log('### get info', res)
          next()
        }).catch((err) => {
          console.log('### get info err', err)
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          }).catch(error => {
            console.log('### error', error)
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // End Progress
})
