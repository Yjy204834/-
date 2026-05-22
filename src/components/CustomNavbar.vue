<template>
  <div class="navbar">
    <div class="navbar-bg">
      <div class="bg-gradient"></div>
      <div class="bg-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>
    <div class="navbar-glow"></div>
    <div class="navbar-content">
      <div class="nav-left">
        <div v-if="showBack" class="nav-back" @click="goBack">
          <div class="back-button">
            <span class="back-arrow">←</span>
          </div>
        </div>
        <span class="nav-title">{{ title }}</span>
        <div class="nav-right"></div>
      </div>
    </div>
    <div v-if="$slots.default" class="navbar-extra">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
  showBack?: boolean
}>()

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.navbar {
  position: relative;
  min-height: $navbar-height;
}

.navbar-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: $bg-gradient-hero;
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.4;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  left: -80px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
}

.circle-2 {
  width: 140px;
  height: 140px;
  top: -60px;
  right: -60px;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.25) 0%, transparent 70%);
}

.circle-3 {
  width: 120px;
  height: 120px;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
}

.navbar-glow {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 0%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(96, 165, 250, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

.navbar-content {
  position: relative;
  z-index: 1;
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.nav-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.nav-back {
  flex: 0 0 auto;
}

.back-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  transition: all $transition-normal;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.96);
    background: rgba(255, 255, 255, 0.15);
  }
}

.back-arrow {
  font-size: 20px;
  color: #ffffff;
  font-weight: 300;
  line-height: 1;
}

.nav-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.4px;
}

.nav-right {
  flex: 0 0 auto;
  width: 40px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title-text {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.nav-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.navbar-extra {
  position: relative;
  z-index: 1;
  padding: $spacing-sm $spacing-base $spacing-base;
  background: linear-gradient(180deg, rgba(30, 64, 175, 0.96) 0%, rgba(30, 58, 138, 0.92) 50%, rgba(30, 64, 175, 0.8) 100%);
  border-radius: 0 0 $radius-xl $radius-xl;
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(180deg, rgba(30, 64, 175, 0.6) 0%, rgba(248, 250, 252, 0.8) 100%);
    border-radius: 0 0 $radius-xl $radius-xl;
    pointer-events: none;
  }
}
</style>
