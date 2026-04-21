import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"

const client = new ClientWithMessageHistory(new Anthropic())
const charParams: ChatParams = {
  model: "claude-sonnet-4-6",
  maxTokens: 1000
}

const msgOne = "What is looksmaxxxing? Answer in 1 sentence please"
const respOne = await client.chat(msgOne, charParams)
client.addUserMessage(msgOne)
client.addAssistantMessage(respOne)
console.log(respOne)

const msgTwo = "Generate a follow up sentence"
const respTwo = await client.chat(msgTwo, charParams)
console.log(respTwo)

