import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"

const client = new ClientWithMessageHistory(new Anthropic())
const charParams: ChatParams = {
  model: "claude-sonnet-4-6",
  maxTokens: 1000
}

const respOne = await client.chat("What is looksmaxxxing? Answer in 1 sentence please", charParams)
console.log(respOne)

const respTwo = await client.chat("Generate a follow up sentence", charParams)
console.log(respTwo)

