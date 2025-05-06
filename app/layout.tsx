import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-provider"
import { LanguageProvider } from "@/lib/language-context"
import { ChatbotProvider } from "@/components/chatbot/chatbot-provider"
import { Chatbot } from "@/components/chatbot/chatbot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kanda Claim",
  description: "A comprehensive insurance management system for Rwanda",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ChatbotProvider>
              {children}
              <Chatbot />
              <Toaster />
            </ChatbotProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
