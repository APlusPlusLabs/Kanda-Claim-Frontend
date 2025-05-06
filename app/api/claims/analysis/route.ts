import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { claimData } = await req.json()

    // Use the AI SDK to analyze the claim
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze the following auto insurance claim data and provide insights:
      ${JSON.stringify(claimData)}
      
      Please provide:
      1. Fraud risk assessment
      2. Confidence score
      3. Key findings
      4. Recommendations
      5. Estimated processing time
      
      Format the response as JSON.`,
    })

    // Parse the AI response
    const analysis = JSON.parse(text)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing claim:", error)
    return NextResponse.json({ error: "Failed to analyze claim" }, { status: 500 })
  }
}
