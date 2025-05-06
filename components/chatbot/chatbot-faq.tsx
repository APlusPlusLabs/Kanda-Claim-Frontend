"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useChatbot } from "./chatbot-provider"

type FAQCategory = {
  id: string
  title: string
  questions: FAQItem[]
}

type FAQItem = {
  id: string
  question: string
  answer: string
}

export function ChatbotFAQ({ portalType }: { portalType: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const { sendMessage } = useChatbot()

  // Get FAQ data based on portal type
  const faqData = getFAQData(portalType)

  // Filter FAQ items based on search query
  const filteredFAQs = searchQuery
    ? faqData.flatMap((category) =>
        category.questions.filter(
          (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    : []

  // Handle FAQ item click
  const handleFAQClick = (question: string) => {
    sendMessage(question)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {searchQuery ? (
          <div className="p-3 space-y-2">
            <h3 className="text-sm font-medium">Search Results</h3>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-md p-3 cursor-pointer hover:bg-muted"
                  onClick={() => handleFAQClick(item.question)}
                >
                  <h4 className="font-medium text-sm">{item.question}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No results found. Try a different search term.</p>
            )}
          </div>
        ) : (
          <div className="p-3">
            <Accordion type="multiple" className="space-y-2">
              {faqData.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border rounded-md">
                  <AccordionTrigger className="px-3 py-2 text-sm font-medium">{category.title}</AccordionTrigger>
                  <AccordionContent className="px-3 pb-2">
                    <div className="space-y-2">
                      {category.questions.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-md p-2 cursor-pointer hover:bg-muted"
                          onClick={() => handleFAQClick(item.question)}
                        >
                          <h4 className="font-medium text-sm">{item.question}</h4>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Helper function to get FAQ data based on portal type
function getFAQData(portalType: string): FAQCategory[] {
  // Common FAQ categories for all portals
  const commonFAQs: FAQCategory[] = [
    {
      id: "general",
      title: "General Information",
      questions: [
        {
          id: "what-is-kanda",
          question: "What is Kanda Claim?",
          answer:
            "Kanda Claim is a comprehensive insurance management system for Rwanda that streamlines the auto insurance claim process for all stakeholders involved.",
        },
        {
          id: "how-to-contact",
          question: "How can I contact customer support?",
          answer:
            "You can contact our customer support team via email at info@kandaclaim.rw or by phone at +250 788 123 456.",
        },
        {
          id: "system-requirements",
          question: "What are the system requirements for using Kanda Claim?",
          answer:
            "Kanda Claim is a web-based platform that works on any modern browser. We recommend using the latest version of Chrome, Firefox, Safari, or Edge.",
        },
      ],
    },
    {
      id: "claims",
      title: "Claims Process",
      questions: [
        {
          id: "submit-claim",
          question: "How do I submit a new claim?",
          answer:
            "To submit a new claim, log in to your account, navigate to the Claims section, click on 'New Claim', and follow the step-by-step process to provide all required information.",
        },
        {
          id: "claim-status",
          question: "How can I check the status of my claim?",
          answer:
            "You can check the status of your claim by logging in to your account and viewing the Claims section, which displays all your active and completed claims.",
        },
        {
          id: "required-documents",
          question: "What documents are required for a claim?",
          answer:
            "Required documents typically include your driver's license, vehicle registration, accident scene photos, vehicle damage photos, and a police report if applicable.",
        },
      ],
    },
    {
      id: "account",
      title: "Account Management",
      questions: [
        {
          id: "reset-password",
          question: "How do I reset my password?",
          answer:
            "To reset your password, click on the 'Forgot Password' link on the login page, enter your email address, and follow the instructions sent to your email.",
        },
        {
          id: "update-profile",
          question: "How can I update my profile information?",
          answer:
            "You can update your profile information by navigating to the Profile section in your dashboard and clicking on the Edit button.",
        },
        {
          id: "delete-account",
          question: "Can I delete my account?",
          answer:
            "To delete your account, please contact our customer support team. Note that account deletion may affect your active claims and insurance policies.",
        },
      ],
    },
  ]

  // Portal-specific FAQ categories
  switch (portalType) {
    case "driver":
      return [
        ...commonFAQs,
        {
          id: "driver-specific",
          title: "Driver-Specific Questions",
          questions: [
            {
              id: "policy-coverage",
              question: "What does my insurance policy cover?",
              answer:
                "Your insurance policy coverage details can be found in the Policy section of your dashboard. It typically includes information about coverage limits, deductibles, and exclusions.",
            },
            {
              id: "accident-steps",
              question: "What should I do immediately after an accident?",
              answer:
                "After an accident, ensure everyone's safety, call for medical help if needed, take photos of the scene and damage, exchange information with other parties, and report to the police.",
            },
            {
              id: "premium-payment",
              question: "How can I pay my insurance premium?",
              answer:
                "You can pay your insurance premium through the Payments section in your dashboard, which supports various payment methods including mobile money and bank transfers.",
            },
          ],
        },
      ]

    case "garage":
      return [
        ...commonFAQs,
        {
          id: "garage-specific",
          title: "Garage-Specific Questions",
          questions: [
            {
              id: "bid-process",
              question: "How does the bidding process work?",
              answer:
                "The bidding process allows you to submit repair cost estimates for approved claims. You can view available jobs, submit detailed bids with cost breakdowns, and track the status of your bids.",
            },
            {
              id: "parts-ordering",
              question: "How can I order parts through the system?",
              answer:
                "You can order parts through our integrated parts catalog in the Resources section. It provides information on availability, pricing, and delivery estimates from various suppliers.",
            },
            {
              id: "payment-schedule",
              question: "What is the payment schedule for completed repairs?",
              answer:
                "Payments for completed repairs are typically processed within 7-14 days after the repair completion is verified by the assessor and approved by the insurance company.",
            },
            {
              id: "repair-standards",
              question: "What repair standards should I follow?",
              answer:
                "All repairs should follow the manufacturer's specifications and industry standards. Detailed repair guidelines are available in the Resources section of your dashboard.",
            },
          ],
        },
      ]

    case "insurer":
      return [
        ...commonFAQs,
        {
          id: "insurer-specific",
          title: "Insurer-Specific Questions",
          questions: [
            {
              id: "assign-assessor",
              question: "How do I assign an assessor to a claim?",
              answer:
                "To assign an assessor, navigate to the claim details page and click on 'Assign Assessor'. You can select from available assessors and schedule the assessment date.",
            },
            {
              id: "approve-claim",
              question: "What is the process for approving a claim?",
              answer:
                "The claim approval process involves reviewing the claim details, assessor's report, and supporting documents. Once verified, you can approve the claim and specify the approved amount.",
            },
            {
              id: "fraud-detection",
              question: "How does the fraud detection system work?",
              answer:
                "Our fraud detection system uses advanced analytics to identify potential fraudulent claims based on various risk factors and patterns. Suspicious claims are flagged for further investigation.",
            },
          ],
        },
      ]

    case "assessor":
      return [
        ...commonFAQs,
        {
          id: "assessor-specific",
          title: "Assessor-Specific Questions",
          questions: [
            {
              id: "assessment-guidelines",
              question: "What are the guidelines for conducting an assessment?",
              answer:
                "Assessment guidelines include thoroughly documenting all damage, taking comprehensive photos, verifying the damage matches the reported incident, and providing detailed cost estimates.",
            },
            {
              id: "submit-report",
              question: "How do I submit an assessment report?",
              answer:
                "To submit an assessment report, navigate to the assigned claim, click on 'Submit Assessment', fill in all required fields, upload supporting photos, and provide your final recommendation.",
            },
            {
              id: "schedule-assessment",
              question: "How can I manage my assessment schedule?",
              answer:
                "You can manage your assessment schedule through the Calendar section in your dashboard, which allows you to view upcoming assessments, reschedule appointments, and set availability.",
            },
          ],
        },
      ]

    default:
      return commonFAQs
  }
}
