import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"                                                           

const client = new ClientWithMessageHistory(new Anthropic())

const model = "claude-sonnet-4-6"
const maxTokens = 500

const chatP: ChatParams = {
  model: "claude-sonnet-4-6",
  maxTokens: 1000,
  temperature: 0
}

const msg = "Generate 5-10 movie recommendations for someone who likes Ari Aster."  
console.log("Streaming starts now!")
const respHighTemp = await client.stream(msg, chatP)

console.log()

console.log("Final response:")
console.log(respHighTemp)

