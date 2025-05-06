"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"

type ChatbotContextType = {
  isOpen: boolean
  toggleChat: () => void
  closeChat: () => void
  openChat: () => void
  messages: ChatMessage[]
  addMessage: (message: string, isUser: boolean) => void
  currentInput: string
  setCurrentInput: (input: string) => void
  sendMessage: (message?: string) => void
  isTyping: boolean
  portalType: "home" | "driver" | "garage" | "insurer" | "assessor"
  escalateToLiveSupport: () => void
  isLiveSupport: boolean
  endLiveSupport: () => void
}

export type ChatMessage = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLiveSupport, setIsLiveSupport] = useState(false)
  const pathname = usePathname()

  // Determine portal type based on URL
  const portalType = (() => {
    if (pathname?.includes("/dashboard/driver")) return "driver"
    if (pathname?.includes("/dashboard/garage")) return "garage"
    if (pathname?.includes("/dashboard/insurer")) return "insurer"
    if (pathname?.includes("/dashboard/assessor")) return "assessor"
    return "home"
  })()

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(portalType)
      addMessage(welcomeMessage, false)
    }
  }, [portalType])

  const toggleChat = () => setIsOpen((prev) => !prev)
  const closeChat = () => setIsOpen(false)
  const openChat = () => setIsOpen(true)

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const sendMessage = (message?: string) => {
    const messageToSend = message || currentInput
    if (!messageToSend.trim()) return

    // Add user message
    addMessage(messageToSend, true)
    setCurrentInput("")

    // Simulate bot typing
    setIsTyping(true)

    // If in live support mode, don't generate automatic responses
    if (isLiveSupport) {
      setTimeout(() => {
        addMessage("A support agent has received your message and will respond shortly.", false)
        setIsTyping(false)
      }, 1000)
      return
    }

    // Generate response based on context and user message
    setTimeout(() => {
      const response = generateResponse(messageToSend, portalType)
      addMessage(response, false)
      setIsTyping(false)
    }, 1500)
  }

  const escalateToLiveSupport = () => {
    setIsLiveSupport(true)
    addMessage(
      "You've been connected to live support. A customer service representative will assist you shortly.",
      false,
    )
    // In a real implementation, this would connect to a live chat service
  }

  const endLiveSupport = () => {
    setIsLiveSupport(false)
    addMessage("Live support session has ended. You're now back with the automated assistant.", false)
  }

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        toggleChat,
        closeChat,
        openChat,
        messages,
        addMessage,
        currentInput,
        setCurrentInput,
        sendMessage,
        isTyping,
        portalType,
        escalateToLiveSupport,
        isLiveSupport,
        endLiveSupport,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}

// Helper functions for generating context-aware responses
function getWelcomeMessage(portalType: string): string {
  switch (portalType) {
    case "driver":
      return "Welcome to Kanda Claim driver support! How can I help you with your insurance claims today?"
    case "garage":
      return "Welcome to Kanda Claim garage support! I can help you with repair processes, parts ordering, and bidding on claims."
    case "insurer":
      return "Welcome to Kanda Claim insurer support! I can assist with claim management, assessments, and policy questions."
    case "assessor":
      return "Welcome to Kanda Claim assessor support! I can help with assessment procedures, documentation, and reporting."
    default:
      return "Welcome to Kanda Claim! I'm here to help you navigate our insurance claim system. How can I assist you today?"
  }
}

function generateResponse(message: string, portalType: string): string {
  const lowerMessage = message.toLowerCase()

  // Common responses across all portals
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I assist you today?"
  }

  if (lowerMessage.includes("thank")) {
    return "You're welcome! Is there anything else I can help you with?"
  }

  if (
    lowerMessage.includes("contact") ||
    lowerMessage.includes("speak to human") ||
    lowerMessage.includes("live agent")
  ) {
    return "If you'd like to speak with a customer service representative, click the 'Live Support' button below."
  }

  // FAQ related responses
  if (lowerMessage.includes("faq") || lowerMessage.includes("frequently asked")) {
    return "You can browse our FAQ sections by category or search for specific topics. What information are you looking for?"
  }

  // Claim creation guidance
  if (
    lowerMessage.includes("create claim") ||
    lowerMessage.includes("submit claim") ||
    lowerMessage.includes("new claim")
  ) {
    return "To create a new claim, follow these steps:\n1. Navigate to the 'Claims' section\n2. Click on 'New Claim' button\n3. Fill in the required information about the incident\n4. Upload supporting documents\n5. Submit your claim for review\n\nWould you like more detailed guidance on any of these steps?"
  }

  // Portal-specific responses
  switch (portalType) {
    case "driver":
      if (lowerMessage.includes("status") || lowerMessage.includes("progress")) {
        return "To check the status of your claim, go to the 'My Claims' section on your dashboard. You can view all active and completed claims there."
      }
      if (lowerMessage.includes("document") || lowerMessage.includes("upload")) {
        return "To upload documents for your claim, open the specific claim from your dashboard, navigate to the 'Documents' tab, and use the upload button to add your files."
      }
      break

    case "garage":
      if (lowerMessage.includes("bid") || lowerMessage.includes("offer")) {
        return "To submit a bid for a repair job, go to the 'Bids' section, select the claim you want to bid on, and click 'Submit Bid'. You'll need to provide a detailed cost breakdown and estimated completion time."
      }
      if (lowerMessage.includes("parts") || lowerMessage.includes("order")) {
        return "For parts ordering assistance, you can check our integrated parts catalog in the 'Resources' section. It provides information on availability, pricing, and delivery estimates."
      }
      break

    case "insurer":
      if (lowerMessage.includes("assess") || lowerMessage.includes("evaluation")) {
        return "To assign an assessor to a claim, go to the claim details page and click on 'Assign Assessor'. You can select from available assessors and schedule the assessment date."
      }
      break
  }

  // Default response if no specific match is found
  return "I'm not sure I understand your question. Could you please rephrase or select from these common topics: claim submission, document requirements, claim status, or contact information?"
}
