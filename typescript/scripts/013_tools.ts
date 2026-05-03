import { Anthropic } from "@anthropic-ai/sdk"
import { getCurrentDatetimeSchema } from "../anthropic/tools/schemas"
import { MessageParam } from "@anthropic-ai/sdk/resources"

const client = new Anthropic()
const messages: MessageParam[] = [
  {
    role: "user",
    content: "What is the exact date? Use yyyy-dd-mm format" 
  }
]

const resp = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  messages: messages,
  tools: [
    getCurrentDatetimeSchema
  ]
})
                                                                       
console.log(JSON.stringify(resp))
console.log(resp)

// TODO handle tool result


  


