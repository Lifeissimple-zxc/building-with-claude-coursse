import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"                                                           

const client = new ClientWithMessageHistory(
  new Anthropic(),
  "claude-sonnet-4-6",
  1000,
)

const chatP: ChatParams = {
  model: "claude-sonnet-4-6",
  maxTokens: 1000
}

const msg = "Generate a very short event bridge rule as JSON"
const responseMessage = await client.chat(msg, chatP)

console.log(responseMessage)
