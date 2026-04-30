<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <img
          src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777363580/ChatGPT_Image_Apr_28_2026_02_47_44_PM-Picsart-BackgroundRemover_skuxrc.png"
          width="72"
          alt="Logo"
        />
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-box">⚠️ {{ error }}</div>

        <div class="field">
          <label>ឈ្មោះអ្នកប្រើ</label>
          <input
            v-model="username"
            type="text"
            placeholder="បញ្ចូលឈ្មោះអ្នកប្រើ"
            required
            autofocus
            :disabled="loading"
          />
        </div>

        <div class="field">
          <label>លេខសម្ងាត់</label>
          <div class="pw-wrap">
            <input
              v-model="password"
              :type="showPw ? 'text' : 'password'"
              placeholder="បញ្ចូលលេខសម្ងាត់"
              required
              :disabled="loading"
            />
            <button type="button" class="eye-btn" @click="showPw = !showPw" tabindex="-1">
              {{ showPw ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>ចូលប្រព័ន្ធ</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const showPw   = ref(false)
const loading  = ref(false)
const error    = ref('')

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4001') + '/api'

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username: username.value, password: password.value }),
    })
    const data = await res.json()
    if (!res.ok) { error.value = data.error || 'ចូលប្រព័ន្ធបរាជ័យ'; return }

    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_user',  JSON.stringify(data.admin))
    router.push({ name: 'rentals' })
  } catch {
    error.value = 'មិនអាចភ្ជាប់ម៉ាស៊ីនបម្រើ — សូមព្យាយាមម្តងទៀត'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.login-page {
  min-height: 100vh;
  background: #f6f5f2;
  font-family: 'DM Sans', system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  -webkit-font-smoothing: antialiased;
}

.login-card {
  background: #fff;
  border: 1px solid #e8e5df;
  border-radius: 18px;
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
  text-align: center;
}

.login-logo { margin-bottom: 18px; }
.login-logo img { display: inline-block; }

.login-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 4px;
}

.login-sub {
  font-size: 0.78rem;
  color: #a8a29e;
  margin-bottom: 28px;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.3px;
}

.login-form { text-align: left; display: flex; flex-direction: column; gap: 16px; }

.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 9px;
  font-size: 0.8rem;
}

.field { display: flex; flex-direction: column; gap: 5px; }

.field label {
  font-size: 0.73rem;
  font-weight: 600;
  color: #57534e;
  letter-spacing: 0.2px;
}

.field input {
  padding: 10px 12px;
  border: 1px solid #e8e5df;
  border-radius: 9px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1c1917;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}

.field input:focus {
  outline: none;
  border-color: #a5b4fc;
  box-shadow: 0 0 0 3px rgba(165,180,252,0.15);
}

.field input:disabled { background: #f6f5f2; color: #a8a29e; cursor: not-allowed; }

.pw-wrap { position: relative; }
.pw-wrap input { padding-right: 42px; }

.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
  padding: 2px;
}

.btn-login {
  width: 100%;
  padding: 11px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) { background: #4338ca; }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .login-card { padding: 28px 20px; }
}
</style>