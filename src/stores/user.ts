import { defineStore } from 'pinia'
import type { User, UserRole, LoginCredentials, Permission, RegisterCredentials } from '@/types/user'
import { rolePermissions } from '@/types/user'

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    isLoggedIn: false
  }),

  getters: {
    permissions(): Permission {
      if (!this.user) {
        return rolePermissions.employee
      }
      return rolePermissions[this.user.role]
    },

    isAdmin(): boolean {
      return this.user?.role === 'admin'
    },

    isEmployee(): boolean {
      return this.user?.role === 'employee'
    }
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<boolean> {
      const mockUsers: Array<User & { password: string }> = [
        {
          id: 'admin001',
          username: 'admin',
          password: 'admin123',
          nickname: '系统管理员',
          role: 'admin',
          department: '安全管理部',
          avatar: ''
        },
        {
          id: 'emp001',
          username: 'employee',
          password: 'emp123',
          nickname: '张三',
          role: 'employee',
          department: '生产车间',
          avatar: ''
        },
        {
          id: 'emp002',
          username: 'zhangsan',
          password: '123456',
          nickname: '李四',
          role: 'employee',
          department: '技术部',
          avatar: ''
        }
      ]

      const storedUsers = localStorage.getItem('registered_users')
      const registeredUsers: Array<User & { password: string }> = storedUsers ? JSON.parse(storedUsers) : []
      
      const allUsers = [...mockUsers, ...registeredUsers]

      const user = allUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      )

      if (user) {
        const { password, ...userInfo } = user
        this.user = userInfo
        this.token = `mock_token_${Date.now()}`
        this.isLoggedIn = true
        
        localStorage.setItem('user_token', this.token)
        localStorage.setItem('user_info', JSON.stringify(this.user))
        
        return true
      }

      return false
    },

    logout() {
      this.user = null
      this.token = null
      this.isLoggedIn = false
      
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
    },

    async register(credentials: RegisterCredentials): Promise<boolean> {
      const storedUsers = localStorage.getItem('registered_users')
      const registeredUsers: Array<User & { password: string }> = storedUsers ? JSON.parse(storedUsers) : []
      
      const userExists = registeredUsers.some(u => u.username === credentials.username)
      if (userExists) {
        return false
      }

      const mockUsers: Array<User & { password: string }> = [
        {
          id: 'admin001',
          username: 'admin',
          password: 'admin123',
          nickname: '系统管理员',
          role: 'admin',
          department: '安全管理部',
          avatar: ''
        },
        {
          id: 'emp001',
          username: 'employee',
          password: 'emp123',
          nickname: '张三',
          role: 'employee',
          department: '生产车间',
          avatar: ''
        },
        {
          id: 'emp002',
          username: 'zhangsan',
          password: '123456',
          nickname: '李四',
          role: 'employee',
          department: '技术部',
          avatar: ''
        }
      ]

      const systemUserExists = mockUsers.some(u => u.username === credentials.username)
      if (systemUserExists) {
        return false
      }
      
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        username: credentials.username,
        nickname: credentials.nickname,
        department: credentials.department,
        password: credentials.password,
        role: credentials.role,
        avatar: ''
      }
      
      registeredUsers.push(newUser)
      localStorage.setItem('registered_users', JSON.stringify(registeredUsers))
      
      return true
    },

    checkAuth(): boolean {
      const token = localStorage.getItem('user_token')
      const userInfo = localStorage.getItem('user_info')
      
      if (token && userInfo) {
        this.token = token
        this.user = JSON.parse(userInfo)
        this.isLoggedIn = true
        return true
      }
      
      return false
    },

    hasPermission(module: keyof Permission, action?: string): boolean {
      if (!this.permissions) return false
      
      const modulePermission = this.permissions[module]
      
      if (typeof modulePermission === 'boolean') {
        return modulePermission
      }
      
      if (action && typeof modulePermission === 'object') {
        return modulePermission[action as keyof typeof modulePermission] || false
      }
      
      return false
    }
  }
})
