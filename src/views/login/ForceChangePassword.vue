<template>
  <div class="forcechange">
    <h2>パスワードの変更</h2>
    <form @submit.prevent="confirm">
      <div>
        email:
        <input type="text" placeholder="メール" v-model="email" required>
      </div>
      <div>
        パスワード:
        <input type="password" placeholder="パスワード" v-model="password" required>
      </div>
      <div>
        新パスワード:
        <input type="password" placeholder="新しいパスワード" v-model="newpassword" required>
      </div>
      <button>確認</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Confirm',
  data () {
    return {
      email: '',
      password: '',
      newpassword: ''
    }
  },
  methods: {
    confirm () {
      this.$cognito.forceChangePassword(this.email, this.password, this.newpassword)
        .then(result => {
          this.$router.replace('/home')
        })
        .then(err => {
          this.error = err
        })
    }
  }
}
</script>
