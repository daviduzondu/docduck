import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './providers/auth.provider'
import { Figtree } from 'next/font/google'
import { cn } from '@/lib/utils'
import TanstackQueryClientProvider from '@/providers/react-query.provider'
import { Toaster } from '@/components/ui/sonner'
import { ConfirmProvider } from '@/providers/confirm-provider'
import { PromptProvider } from '@/providers/prompt.provider'
import { ThemeProvider } from 'next-themes'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
 title: 'DocDuck',
 description: 'An editing experience like no other.',
}

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode
}>) {
 return (
  <html lang="en" className={cn('font-sans', figtree.variable)}>
   <body>
    <ThemeProvider
     attribute="class"
     defaultTheme="system"
     enableSystem
     disableTransitionOnChange
    >
     <TanstackQueryClientProvider>
      <AuthProvider>
       <ConfirmProvider>
        <PromptProvider>
         {children}
         <Toaster richColors theme="light" position="bottom-left" />
        </PromptProvider>
       </ConfirmProvider>
      </AuthProvider>
     </TanstackQueryClientProvider>
    </ThemeProvider>
   </body>
  </html>
 )
}
