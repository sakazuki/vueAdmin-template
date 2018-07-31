<template>
  <div class="confirm">
    <h2>パスワードを忘れたフロー</h2>
    <form @submit.prevent="confirm">
      <div>
        メール:
        <input type="text" placeholder="メール" v-model="username" required>
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
      username: ''
    }
  },
  methods: {
    confirm () {
      this.$cognito.forgotPassword(this.username)
        .then(result => {
          this.$router.replace('/passwordreset')
        })
        .then(err => {
          this.error = err
        })
    }
  }
}
</script>
