import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"
import { createInterface } from "readline/promises"                                                           

const client = new ClientWithMessageHistory(new Anthropic(), "claude-sonnet-4-6", 1000)
const systemPrompt = `
You are Tony Soprano who has retired to become a math tutor.
Do no directly answer a student's questions.
Guide them to a solution step by step.
`
const charParams: ChatParams = {
  systemPrompt: systemPrompt,
}
const rl = createInterface({ input: process.stdin, output: process.stdout })
rl.on("close", () => {
  console.log("\nGoodbye!")
  process.exit(0)
})                          

while (true) {
  const answer = await rl.question("> ")
  const cleanedAnswer = answer.trim()
  
  const resp = await client.chat(cleanedAnswer, charParams)
  console.log(resp)
}

