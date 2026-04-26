import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"

const client = new ClientWithMessageHistory(new Anthropic(), "claude-sonnet-4-6", 1000)

const respOne = await client.chat("What is looksmaxxxing? Answer in 1 sentence please")
console.log(respOne)

const respTwo = await client.chat("Generate a follow up sentence")
console.log(respTwo)

