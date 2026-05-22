<template>
  <div class="container">
    <CustomNavbar title="AI智能问答">
      <div class="section-tabs">
        <div class="tabs-container">
          <div 
            v-for="tab in availableTabs" 
            :key="tab.key"
            :class="['tab-item', { active: activeTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            <div class="tab-icon">{{ tab.key === 'general' ? '🤖' : '🛡️' }}</div>
            <span class="tab-title">{{ tab.label }}</span>
          </div>
        </div>
        <div class="history-btn" @click="showHistory = !showHistory">
          <span class="history-icon">📜</span>
          <span class="history-text">历史记录</span>
        </div>
      </div>
    </CustomNavbar>
    <div class="page-content">
      <div v-if="showHistory" class="history-panel">
        <div class="history-header">
          <span class="history-title">历史问答记录</span>
          <span class="clear-history" @click="clearHistory">清空</span>
        </div>
        <div class="history-list">
          <div 
            v-for="(item, index) in historyList" 
            :key="index"
            class="history-item"
            @click="loadHistoryItem(item)"
          >
            <div class="history-question">{{ item.question }}</div>
            <div class="history-time">{{ formatTime(item.time) }}</div>
          </div>
          <div v-if="historyList.length === 0" class="empty-history">
            <span>暂无历史记录</span>
          </div>
        </div>
      </div>

      <div class="chat-section">
        <div class="chat-content">
          <div 
            v-for="(item, index) in messages" 
            :key="index"
            :class="['chat-message', { 'is-user': item.isUser }]"
          >
            <div class="message-avatar">
              <span>{{ item.isUser ? '👤' : '🤖' }}</span>
            </div>
            <div class="message-content">
              <div :class="['message-bubble', { user: item.isUser }]">
                <span class="message-text">{{ item.content }}</span>
              </div>
              <span class="message-time">{{ formatTime(item.id) }}</span>
            </div>
          </div>

          <div v-if="messages.length <= 1 && !messages.some(m => m.isUser)" class="empty-chat">
            <div class="empty-illustration">
              <div class="illustration-icon">💬</div>
              <div class="illustration-pulse"></div>
              <div class="illustration-pulse pulse-delay"></div>
            </div>
            <span class="empty-title">{{ activeTab === 'general' ? '欢迎使用AI助手' : '安全知识问答' }}</span>
            <span class="empty-description">
              {{ activeTab === 'general' ? '有什么问题随时问我，我来帮您解答' : '关于安全生产的问题，我来为您提供专业建议' }}
            </span>
            <div class="quick-actions">
              <span class="quick-label">试试这些问题：</span>
              <div class="action-tags">
                <div 
                  v-for="(q, idx) in quickQuestions" 
                  :key="idx"
                  class="action-tag"
                  @click="quickQuestion(q)"
                >
                  <span>{{ q }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="typing-indicator">
            <div class="typing-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <span class="typing-text">AI正在思考...</span>
          </div>
        </div>
      </div>

      <div class="input-section">
        <div class="input-wrapper">
          <input 
            v-model="inputMessage" 
            class="input-field" 
            placeholder="输入您的问题..."
            @keyup.enter="sendMessage"
          />
          <div 
            :class="['send-button', { active: inputMessage.trim() }]"
            @click="sendMessage"
          >
            <span class="send-arrow">➤</span>
          </div>
        </div>
      </div>
    </div>
    <CustomTabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import CustomNavbar from '@/components/CustomNavbar.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { useUserStore } from '@/stores/user'
import { type Message } from '@/data/mock.ts'
import { deepseekApi, type DeepSeekMessage } from '@/api/deepseek.ts'

const router = useRouter()
const userStore = useUserStore()

const availableTabs = computed(() => {
  const tabs = []
  tabs.push({ key: 'general', label: 'AI问答' })
  tabs.push({ key: 'safety', label: '安全问答' })
  return tabs
})

const quickQuestions = computed(() => {
  return activeTab.value === 'general' 
    ? [
        '电解槽的工作原理是什么？',
        '如何提高生产效率？',
        '设备维护的注意事项？'
      ]
    : [
        '安全生产的基本原则？',
        '遇到紧急情况怎么办？',
        '如何预防安全事故？'
      ]
})

const maxQuestionLength = 500
const safetyKeywords = ['安全', '生产', '事故', '隐患', '防护', '应急', '消防', '设备', '操作', '规范', '标准', '检查', '培训', '监测', '预警', '巡检']

const isSafetyRelated = (question: string): boolean => {
  return safetyKeywords.some(keyword => question.includes(keyword))
}

const validateQuestion = (question: string): { valid: boolean; message?: string } => {
  if (!question.trim()) {
    return { valid: false, message: '请输入问题内容' }
  }
  
  if (question.length > maxQuestionLength) {
    return { valid: false, message: `问题不能超过${maxQuestionLength}个字符` }
  }
  
  if (activeTab.value === 'safety' && !isSafetyRelated(question)) {
    return { valid: false, message: '安全问答模式下，请提出与安全生产相关的问题' }
  }
  
  return { valid: true }
}

const activeTab = ref(availableTabs.value[0]?.key || 'general')
const inputMessage = ref('')
const messages = ref<Message[]>([])
const isTyping = ref(false)
const showHistory = ref(false)

interface HistoryItem {
  question: string
  answer: string
  time: number
  tab: string
}

const historyList = computed(() => {
  try {
    const history = localStorage.getItem('ai_chat_history')
    if (history) {
      const allHistory: HistoryItem[] = JSON.parse(history)
      return allHistory.filter(item => item.tab === activeTab.value).reverse().slice(0, 20)
    }
  } catch {}
  return []
})

const addToHistory = (question: string, answer: string) => {
  try {
    const history = localStorage.getItem('ai_chat_history')
    const allHistory: HistoryItem[] = history ? JSON.parse(history) : []
    allHistory.push({
      question,
      answer,
      time: Date.now(),
      tab: activeTab.value
    })
    localStorage.setItem('ai_chat_history', JSON.stringify(allHistory.slice(-50)))
  } catch {}
}

const loadHistoryItem = (item: HistoryItem) => {
  showHistory.value = false
  inputMessage.value = item.question
  sendMessage()
}

const clearHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    try {
      localStorage.removeItem('ai_chat_history')
    } catch {}
  }
}

const loadHistoryMessages = (tabKey: string) => {
  try {
    const history = localStorage.getItem(`chat_history_${tabKey}`)
    if (history) {
      messages.value = JSON.parse(history)
    } else {
      messages.value = getDefaultMessages(tabKey)
    }
  } catch {
    messages.value = getDefaultMessages(tabKey)
  }
}

const saveHistoryMessages = () => {
  try {
    localStorage.setItem(`chat_history_${activeTab.value}`, JSON.stringify(messages.value))
  } catch {}
}

const getDefaultMessages = (tabKey: string): Message[] => {
  return [{
    id: Date.now() - 3600000,
    content: tabKey === 'safety' 
      ? '您好！我是安全生产知识顾问。关于安全生产的问题，我可以为您提供专业的建议。'
      : '您好！我是AI助手，很高兴为您服务。有什么我可以帮助您的吗？',
    isUser: false
  }]
}

const switchTab = (tabKey: string) => {
  saveHistoryMessages()
  activeTab.value = tabKey
  loadHistoryMessages(tabKey)
}

loadHistoryMessages(activeTab.value)

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const quickQuestion = (question: string) => {
  inputMessage.value = question
  sendMessage()
}

const sendMessage = async () => {
  const validation = validateQuestion(inputMessage.value)
  
  if (!validation.valid) {
    alert(validation.message)
    return
  }
  
  const userQuestion = inputMessage.value
  
  messages.value.push({
    id: Date.now(),
    content: inputMessage.value,
    isUser: true
  })
  
  inputMessage.value = ''
  saveHistoryMessages()
  
  isTyping.value = true
  
  try {
    const systemPrompt = activeTab.value === 'safety' 
      ? '你是一位专业的安全生产知识顾问，擅长解答关于安全生产、设备安全、安全操作规范、事故预防、应急处理等方面的问题。请用简洁明了的语言提供专业的安全建议。'
      : '你是一位专业的AI助手，擅长解答各类问题。请提供准确、有用的回答。'
    
    const chatHistory: DeepSeekMessage[] = [{
      role: 'system',
      content: systemPrompt
    }]
    
    chatHistory.push(...messages.value.slice(0, -1).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    })))
    
    chatHistory.push({
      role: 'user',
      content: messages.value[messages.value.length - 1].content
    })
    
    const response = await deepseekApi.chat(chatHistory)
    
    messages.value.push({
      id: Date.now() + 1,
      content: response,
      isUser: false
    })
    
    addToHistory(userQuestion, response)
  } catch (error) {
    messages.value.push({
      id: Date.now() + 1,
      content: '抱歉，当前服务暂时不可用，请稍后再试。',
      isUser: false
    })
  }
  
  isTyping.value = false
  saveHistoryMessages()
}

</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(30, 64, 175, 0.02) 0%, #F8FAFC 8%, #F1F5F9 100%);
}

.page-content {
  padding-top: 0;
  padding-bottom: calc(#{$tabbar-height} + env(safe-area-inset-bottom) + #{$spacing-xl});
  min-height: calc(100vh - #{$statusbar-height});
  display: flex;
  flex-direction: column;
  margin-top: calc(#{$navbar-height} + #{$statusbar-height} - 8px);
}

.section-tabs {
  padding: $spacing-sm $gutter-sm $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.tabs-container {
  display: flex;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: $radius-md;
  padding: $spacing-xs;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.history-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-xl;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: $radius-md;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all $transition-normal;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.18);
  }
}

.history-icon {
  font-size: $text-size-md;
}

.history-text {
  font-size: $text-size-base;
  font-weight: $font-weight-medium;
  color: rgba(255, 255, 255, 0.95);
}

.history-panel {
  margin: 0 $gutter-sm $spacing-md;
  background: #ffffff;
  border-radius: $radius-lg;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base $spacing-lg;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.history-title {
  font-size: $text-size-md;
  font-weight: $font-weight-semibold;
  color: #1D1D1F;
}

.clear-history {
  font-size: $text-size-sm;
  color: $danger-light;
  cursor: pointer;
  font-weight: $font-weight-medium;
  
  &:hover {
    text-decoration: underline;
  }
}

.history-list {
  max-height: 220px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: $spacing-base $spacing-lg;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all $transition-normal;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(30, 64, 175, 0.04);
  }
}

.history-question {
  flex: 1;
  font-size: $text-size-base;
  color: #1D1D1F;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: $text-size-xs;
  color: #9CA3AF;
  margin-left: $spacing-base;
  flex-shrink: 0;
}

.empty-history {
  padding: $spacing-2xl;
  text-align: center;
  font-size: $text-size-base;
  color: #9CA3AF;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all $transition-bounce;
  
  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.15);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    
    .tab-icon {
      transform: scale(1.15);
      
      filter: brightness(0) saturate(100%) invert(24%) sepia(70%) saturate(1500%) hue-rotate(220deg) brightness(90%);
    }
    
    .tab-title {
      color: $primary;
    }
  }
}

.tab-title {
  font-size: $text-size-base;
  font-weight: $font-weight-semibold;
  color: rgba(255, 255, 255, 0.95);
}

.tab-icon {
  font-size: $text-size-xl;
  transition: transform $transition-bounce;
}

.chat-section {
  flex: 1;
  padding: 0 $gutter-sm;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.chat-content {
  padding-bottom: $spacing-md;
  padding-top: $spacing-xs;
}

.chat-message {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-base;
  animation: messageIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.is-user {
    flex-direction: row-reverse;
    
    .message-avatar {
      background: $primary-gradient;
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }
    
    .message-content {
      align-items: flex-end;
    }
    
    .message-bubble {
      background: $primary-gradient;
      border-radius: $radius-lg $radius-xs $radius-lg $radius-lg;
      box-shadow: 0 6px 20px rgba(30, 64, 175, 0.3);
    }
    
    .message-text {
      color: #ffffff;
    }
    
    .message-time {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY($spacing-md);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border-radius: $radius-md;
  font-size: $text-size-lg;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 78%;
  gap: $spacing-sm;
}

.message-bubble {
  padding: $spacing-base;
  background: #ffffff;
  border-radius: $radius-xs $radius-lg $radius-lg $radius-lg;
  box-shadow: $shadow-md;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.message-text {
  font-size: $text-size-md;
  line-height: $line-height-relaxed;
  color: #1D1D1F;
}

.message-time {
  font-size: $text-size-xs;
  color: #9CA3AF;
  padding: 0 $spacing-sm;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-base $gutter-sm;
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.empty-illustration {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.illustration-icon {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  filter: drop-shadow(0 4px 12px rgba(30, 64, 175, 0.15));
}

.illustration-pulse {
  position: absolute;
  inset: 0;
  z-index: 1;
  border: 3px solid rgba(30, 64, 175, 0.1);
  border-radius: 50%;
  animation: pulseRing 2.5s ease-out infinite;
  
  &.pulse-delay {
    animation-delay: 1.25s;
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D1D1F;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #9CA3AF;
  text-align: center;
  max-width: 240px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.quick-actions {
  width: 100%;
  max-width: 340px;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quick-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 12px;
  text-align: center;
}

.action-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-tag {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all $transition-bounce;
  text-align: center;
  
  text {
    font-size: 15px;
    font-weight: 500;
    color: #1D1D1F;
    line-height: 1.5;
  }
  
  &:hover {
    background: $primary-gradient;
    border-color: transparent;
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(30, 64, 175, 0.35);
    
    text {
      color: #ffffff;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.typing-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: $primary;
  border-radius: 50%;
  animation: bounceDot 1.4s infinite ease-in-out;
  
  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.15s; }
  &:nth-child(3) { animation-delay: 0.3s; }
}

@keyframes bounceDot {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
}

.input-section {
  position: fixed;
  bottom: $tabbar-height;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.05);
  z-index: 20;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-field {
  flex: 1;
  height: 44px;
  padding: 0 20px;
  background: #F1F5F9;
  border-radius: 22px;
  font-size: 15px;
  color: #1D1D1F;
  border: 2px solid transparent;
  transition: all $transition-normal;
  
  &:focus {
    background: #ffffff;
    border-color: $primary;
    box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.08);
  }
  
  &::placeholder {
    color: #9CA3AF;
    font-size: 14px;
  }
}

.send-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border-radius: 22px;
  cursor: pointer;
  transition: all $transition-bounce;
  
  &.active {
    background: $primary-gradient;
    box-shadow: 0 4px 16px rgba(30, 64, 175, 0.35);
    
    .send-arrow {
      color: #ffffff;
    }
  }
  
  &:active {
    transform: scale(0.92);
  }
}

.send-arrow {
  font-size: 18px;
  color: #9CA3AF;
  transition: all $transition-normal;
}
</style>
