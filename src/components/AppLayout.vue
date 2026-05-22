﻿﻿﻿<template>
  <div class="app-layout">
    <CustomNavbar 
      :title="title" 
      :showBack="showBack" 
    />
    <div class="layout-content" :style="{ paddingBottom: showTabBar ? `${tabbarHeight}px` : '0' }">
      <slot></slot>
    </div>
    <CustomTabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import CustomNavbar from './CustomNavbar.vue'
import CustomTabBar from './CustomTabBar.vue'

defineProps<{
  title: string
  showBack?: boolean
  showTabBar?: boolean
}>()

const tabbarHeight = 60 + (typeof window !== 'undefined' ? (window.safeAreaBottom || 0) : 0)
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  position: relative;
  background: $bg-gradient;
}

.layout-content {
  padding-top: calc(#{$navbar-height} + #{$statusbar-height});
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
