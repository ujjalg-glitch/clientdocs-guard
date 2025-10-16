import type { User } from '@prisma/client'
import type { API } from '@/lib/http'

export interface LoginAPI extends API {
  data: { user: User | null }
}

export interface RegisterAPI extends API {
  data: { user: User | null }
}

export interface ForgotPasswordAPI extends API {
  data: {}
}

export interface NewPasswordAPI extends API {
  data: { user: User | null }
}
