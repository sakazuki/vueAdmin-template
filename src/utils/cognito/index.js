import Vue from 'vue'
import Cognito from './cognito'

Vue.use(Cognito, process.env)

export default new Cognito()
