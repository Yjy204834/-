<template>
  <div class="container">
    <CustomNavbar title="个人中心">
      <div class="profile-card">
        <div class="avatar-wrapper">
          <div class="avatar">
            <span class="avatar-text">{{ userStore.user?.nickname?.charAt(0) || '👤' }}</span>
          </div>
          <div class="avatar-glow"></div>
        </div>
        <div class="profile-info">
          <span class="profile-name">{{ userStore.user?.nickname || '用户' }}</span>
          <div class="role-tag">
            <span class="role-text">{{ userStore.isAdmin ? '管理员' : '员工' }}</span>
          </div>
        </div>
      </div>
    </CustomNavbar>
    <div class="page-content">
      <div class="menu-grid">
        <div class="menu-item" @click="goToPage('/profile/notifications')">
          <div class="menu-icon-wrapper notification-icon">
            <span class="menu-icon">🔔</span>
          </div>
          <span class="menu-text">通知中心</span>
          <div v-if="hasUnreadNotifications" class="notification-badge"></div>
        </div>

        <div class="menu-item" @click="goToPage('/profile/learning-records')">
          <div class="menu-icon-wrapper learning-icon">
            <span class="menu-icon">📚</span>
          </div>
          <span class="menu-text">学习记录</span>
        </div>

        <div class="menu-item" @click="goToPage('/profile/salary')">
          <div class="menu-icon-wrapper salary-icon">
            <span class="menu-icon">💰</span>
          </div>
          <span class="menu-text">薪资查询</span>
        </div>

        <div class="menu-item" @click="goToPage('/profile/settings')">
          <div class="menu-icon-wrapper settings-icon">
            <span class="menu-icon">⚙️</span>
          </div>
          <span class="menu-text">设置</span>
        </div>
      </div>

      <div class="logout-section">
        <div class="logout-item" @click="handleLogout">
          <div class="logout-icon-wrapper">
            <span class="logout-icon">🚪</span>
          </div>
          <span class="logout-text">退出登录</span>
        </div>
      </div>
    </div>
    <CustomTabBar />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CustomNavbar from '@/components/CustomNavbar.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const hasUnreadNotifications = computed(() => {
  return true
})

const goToPage = (path: string) => {
  router.push(path)
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
}

.page-content {
  padding: 18px 16px $tabbar-height;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: calc(#{$navbar-height} + #{$statusbar-height});
}

.profile-header {
  padding: 0 0 8px;
  margin-top: 0;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    left: -50px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 70%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.08) 0%, transparent 70%);
  }
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: $primary-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.3);
  position: relative;
  z-index: 2;
}

.avatar-text {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 82px;
  height: 82px;
  border-radius: 24px;
  border: 3px solid rgba(30, 64, 175, 0.15);
  animation: pulseRing 2.5s ease-out infinite;
}

@keyframes pulseRing {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  z-index: 2;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  align-self: flex-start;
}

.role-text {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding: 10px 0;
}

.menu-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 22px;
  padding: 28px 18px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.05),
    0 1px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all $transition-bounce;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(-2px) scale(0.99);
  }
}

.menu-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-normal;
}

.notification-icon {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.35);
}

.learning-icon {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  box-shadow: 0 6px 16px rgba(78, 205, 196, 0.35);
}

.salary-icon {
  background: linear-gradient(135deg, #FFA07A 0%, #FF7F50 100%);
  box-shadow: 0 6px 16px rgba(255, 127, 80, 0.35);
}

.settings-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
}

.menu-icon {
  font-size: 30px;
}

.menu-text {
  font-size: 15px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
}

.notification-badge {
  position: absolute;
  top: 18px;
  right: 22px;
  width: 12px;
  height: 12px;
  background: #EF4444;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
  animation: badgePulse 1.8s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.1);
  }
}

.logout-section {
  margin-top: 10px;
}

.logout-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all $transition-normal;

  &:hover {
    background: rgba(239, 68, 68, 0.08);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.99);
  }
}

.logout-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon {
  font-size: 22px;
}

.logout-text {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #EF4444;
}
</style>
