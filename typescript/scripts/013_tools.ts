import { Anthropic } from "@anthropic-ai/sdk"
import { getCurrentDatetimeSchema } from "../anthropic/tools/schemas"
import { MessageParam } from "@anthropic-ai/sdk/resources"
import { getCurrentDatetime } from "../anthropic/tools/tools"

const client = new Anthropic()
const messages: MessageParam[] = [
  {
    role: "user",
    content: "What is the exact time? Use HH:mm:ss format" 
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

// if we do get a request, it will be the last item in the content sequence
const toolUseRequest = resp.content.at(-1)
if (toolUseRequest?.type !== "tool_use") {
  throw new Error("aint the right type here my man")
}
const toolInput = toolUseRequest.input as { dateFormat?: string }

const dt = getCurrentDatetime(toolInput.dateFormat)

messages.push({role: "assistant", content: resp.content})
messages.push({
  role: "user",
  content: [
    {
      type: "tool_result",
      tool_use_id: toolUseRequest.id,
      content: dt,
      is_error: false
    }
  ]
})

const followup = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  messages: messages,
  tools: [
    getCurrentDatetimeSchema
  ]
})

console.log(JSON.stringify(followup, null, 2))



  


