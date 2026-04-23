import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"                                                    

const client = new ClientWithMessageHistory(new Anthropic())

const model = "claude-sonnet-4-6"
const maxTokens = 500

const msg = "Generate a one sentence movie idea"  
const respHighTemp = await client.chat(msg, {
  model: model,
  maxTokens: maxTokens,
  temperature: 100
})
console.log("High temp")
console.log(respHighTemp)

console.log("--")
console.log("Low temp")
const respLowTemp = await client.chat(msg, {
  model: model,
  maxTokens: maxTokens,
  temperature: 0
})
console.log(respLowTemp)

