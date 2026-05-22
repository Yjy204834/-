﻿﻿﻿﻿<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-content">
      <div class="login-header">
        <div class="logo-wrapper">
          <div class="logo">
            <span class="logo-icon">🏭</span>
          </div>
          <div class="logo-glow"></div>
        </div>
        <span class="title">万基化工</span>
        <span class="subtitle">安全生产管理平台</span>
      </div>

      <div class="login-card animate-scale-in">
        <div class="card-header">
          <span class="card-title">账号登录</span>
          <div class="card-decoration"></div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input 
              v-model="form.username" 
              class="form-input" 
              placeholder="请输入用户名"
              @input="clearError"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <span class="input-icon">🔐</span>
            <input 
              v-model="form.password" 
              class="form-input" 
              type="password"
              placeholder="请输入密码"
              @input="clearError"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ errorMessage }}</span>
        </div>

        <div 
          class="login-button"
          :class="{ loading: loading }"
          @click="handleLogin"
        >
          <span v-if="!loading" class="button-text">登 录</span>
          <div v-else class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </div>

        <div class="register-link">
          <span class="link-text">还没有账号？</span>
          <span class="link-action" @click="goToRegister">立即注册</span>
        </div>

        <div class="demo-section">
          <div class="demo-header">
            <span class="demo-title">演示账号</span>
            <div class="demo-badge">点击快速登录</div>
          </div>
          <div class="account-grid">
            <div 
              class="account-card admin"
              @click="fillAccount('admin', 'admin123')"
            >
              <div class="account-icon">👔</div>
              <div class="account-info">
                <span class="account-role">管理员</span>
                <span class="account-credentials">admin / admin123</span>
              </div>
              <div class="account-arrow">→</div>
            </div>
            <div 
              class="account-card employee"
              @click="fillAccount('employee', 'emp123')"
            >
              <div class="account-icon">👷</div>
              <div class="account-info">
                <span class="account-role">员工</span>
                <span class="account-credentials">employee / emp123</span>
              </div>
              <div class="account-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-footer">
        <span class="footer-text">© 2024 万基化工 版权所有</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const clearError = () => {
  errorMessage.value = ''
}

const fillAccount = (username: string, password: string) => {
  form.value.username = username
  form.value.password = password
  clearError()
}

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const success = await userStore.login({
      username: form.value.username,
      password: form.value.password
    })

    if (success) {
      alert('登录成功')

      setTimeout(() => {
        const defaultPath = userStore.isAdmin ? '/monitor' : '/ai-qa'
        router.replace(defaultPath)
      }, 500)
    } else {
      errorMessage.value = '用户名或密码错误'
    }
  } catch (error) {
    errorMessage.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $primary-gradient;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(30, 110, 216, 0.1) 0%, transparent 60%);
  }
}

.login-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: $spacing-xl $spacing-lg;
  padding-top: calc(#{$statusbar-height} + #{$spacing-2xl});
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-2xl 0;
}

.logo-wrapper {
  position: relative;
  margin-bottom: $spacing-xl;
}

.logo {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: $radius-2xl;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  
  .logo-icon {
    font-size: 48px;
  }
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  filter: blur(20px);
  animation: pulse 3s ease-in-out infinite;
}

.title {
  font-size: $text-size-4xl;
  font-weight: $font-weight-bold;
  color: #ffffff;
  margin-bottom: $spacing-sm;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: $text-size-sm;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2px;
}

.login-card {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-2xl;
  box-shadow: $shadow-xl;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.card-header {
  text-align: center;
  margin-bottom: $spacing-2xl;
  position: relative;
}

.card-title {
  font-size: $text-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  display: block;
}

.card-decoration {
  position: absolute;
  bottom: -$spacing-sm;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: $primary-gradient;
  border-radius: $radius-full;
}

.form-group {
  margin-bottom: $spacing-lg;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: $bg-tertiary;
  border-radius: $radius-lg;
  padding: 0 $spacing-md;
  border: 2px solid transparent;
  transition: all $transition-normal;
  
  &:focus-within {
    background: $bg-primary;
    border-color: $primary;
    box-shadow: $shadow-glow;
  }
}

.input-icon {
  font-size: $text-size-lg;
  margin-right: $spacing-sm;
}

.form-input {
  flex: 1;
  height: $button-height-lg;
  font-size: $text-size-base;
  color: $text-primary;
  
  &::placeholder {
    color: $text-placeholder;
  }
}

.error-message {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  background: $danger-glow;
  border-radius: $radius-md;
  margin-bottom: $spacing-lg;
  
  .error-icon {
    font-size: $text-size-sm;
    margin-right: $spacing-xs;
  }
  
  .error-text {
    font-size: $text-size-sm;
    color: $danger;
    font-weight: $font-weight-medium;
  }
}

.login-button {
  width: 100%;
  height: $button-height-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary-gradient;
  border-radius: $radius-lg;
  border: none;
  cursor: pointer;
  transition: all $transition-normal;
  box-shadow: $shadow-md;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left $transition-slow;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: $shadow-sm;
  }
  
  &.loading {
    opacity: 0.8;
    cursor: not-allowed;
  }
}

.button-text {
  font-size: $text-size-base;
  font-weight: $font-weight-semibold;
  color: #ffffff;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  
  .spinner {
    width: 100%;
    height: 100%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-xs;
  margin: $spacing-lg 0;
}

.link-text {
  font-size: $text-size-sm;
  color: $text-tertiary;
}

.link-action {
  font-size: $text-size-sm;
  color: $primary;
  font-weight: $font-weight-semibold;
  
  &:hover {
    text-decoration: underline;
  }
}

.demo-section {
  margin-top: $spacing-xl;
  padding-top: $spacing-xl;
  border-top: 1px solid $border-light;
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.demo-title {
  font-size: $text-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-secondary;
}

.demo-badge {
  padding: 2px 8px;
  background: rgba($primary, 0.1);
  color: $primary;
  font-size: $text-size-xxs;
  font-weight: $font-weight-medium;
  border-radius: $radius-full;
}

.account-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.account-card {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-lg;
  border: 2px solid transparent;
  transition: all $transition-normal;
  cursor: pointer;
  
  &:hover {
    transform: translateX(4px);
    border-color: $primary;
    box-shadow: $shadow-sm;
  }
  
  &.admin {
    .account-icon {
      background: rgba($danger, 0.1);
    }
    
    .account-role {
      color: $danger;
    }
  }
  
  &.employee {
    .account-icon {
      background: rgba($success, 0.1);
    }
    
    .account-role {
      color: $success;
    }
  }
}

.account-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  font-size: $text-size-xl;
  margin-right: $spacing-md;
}

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-role {
  font-size: $text-size-sm;
  font-weight: $font-weight-semibold;
}

.account-credentials {
  font-size: $text-size-xs;
  color: $text-tertiary;
}

.account-arrow {
  font-size: $text-size-lg;
  color: $text-muted;
}

.login-footer {
  padding: $spacing-xl 0;
  text-align: center;
}

.footer-text {
  font-size: $text-size-xs;
  color: rgba(255, 255, 255, 0.6);
}
</style>
