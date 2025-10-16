import { z } from 'zod'

export const sidebarOptInFormSchema = z.object({
  email: z.string().min(4).max(255).email(),
})
