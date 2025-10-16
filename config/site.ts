export const siteConfig = {
  name: 'ClientDocs Guard',
  description: 'Secure document management system with PDF support and AI integration',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '',
  links: {
    twitter: '',
    github: '',
  },
}

export type SiteConfig = typeof siteConfig

