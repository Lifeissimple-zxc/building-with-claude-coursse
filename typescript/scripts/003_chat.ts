import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"
import { createInterface } from "readline/promises"                                                           
                                                    


const client = new ClientWithMessageHistory(new Anthropic())
const charParams: ChatParams = {
  model: "claude-sonnet-4-6",
  maxTokens: 1000
}
const rl = createInterface({ input: process.stdin, output: process.stdout })
rl.on("close", () => {
  console.log("\nGoodbye!")
  process.exit(0)
})                          

while (true) {
  const answer = await rl.question("Enter something: ")
  const cleanedAnswer = answer.trim()
  
  const resp = await client.chat(cleanedAnswer, charParams)
  console.log(resp)
}

