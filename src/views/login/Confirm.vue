<template>
  <div class="confirm">
    <h2>確認コード入力</h2>
    <form @submit.prevent="confirm">
      <div>
        メール:
        <input type="text" placeholder="メール" v-model="username" required>
      </div>
      <div>
        パスワード:
        <input type="text" placeholder="確認コード" v-model="confirmationCode" required>
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
      username: '',
      confirmationCode: ''
    }
  },
  methods: {
    confirm () {
      this.$cognito.confirmation(this.username, this.confirmationCode)
        .then(result => {
          this.$router.replace('/login')
        })
        .then(err => {
          this.error = err
        })
    }
  }
}
</script>
