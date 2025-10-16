import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/login-form'

export const metadata: Metadata = {
  title: 'ClientDocs Guard - Login',
  description: 'Secure document management platform',
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold text-xl">ClientDocs Guard</span>
            </Link>
          </div>
          <nav className="flex gap-4">
            <Link href="/auth/register">
              <span className="text-sm text-muted-foreground hover:text-foreground">
                Don't have an account? Sign Up
              </span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-md">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email to sign in to your account
              </p>
            </div>
            <LoginForm />
            <div className="text-center text-sm text-muted-foreground">
              <Link
                href="/auth/register"
                className="hover:text-brand underline underline-offset-4"
              >
                Don&apos;t have an account? Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

