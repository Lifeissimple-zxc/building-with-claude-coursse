import { Anthropic } from "@anthropic-ai/sdk"
import {
  getCurrentDatetimeSchema,
  addDurationDateSchema
} from "../anthropic/tools/schemas"
import { MessageParam, Message } from "@anthropic-ai/sdk/resources"
import {
  getCurrentDatetime,
  addDurationToDate,
  AddDurationToDateParams
} from "../anthropic/tools/tools"
import { textFromMessage } from "../anthropic/helpers"

const client = new Anthropic()

const convoResult = await runConversation(client, "Add 2 days to the current date and tell me the result. Return the datetime strig only, no comments, formatting or emojis.")
console.log("convo res:")
console.log(convoResult)

console.log("response text")
console.log(textFromMessage(convoResult))

async function runConversation(client: Anthropic, initialMessage: string): Promise<Message> {
  const messages: MessageParam[] = [{role: "user", content: initialMessage}]

  while (true) {
    const resp = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: messages,
      tools: [getCurrentDatetimeSchema, addDurationDateSchema]
    })
    // end of the road mate
    if (resp.stop_reason !== "tool_use") {
      return resp
    }
    messages.push({role: "assistant", content: resp.content})

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of resp.content) {
      if (block.type !== "tool_use") continue

      let result: string
      try {
        switch (block.name) {
          case "getCurrentDatetime": {
            const input = block.input as {dateFormat?: string}
            result = getCurrentDatetime(input.dateFormat)
            break
          }
          case "addDurationToDate": {
            const input = block.input as AddDurationToDateParams
            result = addDurationToDate(input)
            break
          }
          default: {
            throw new Error(`unexpected tool: ${block.name}`)
          }
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
          is_error: false
        })
      } catch (e) {
         toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: String(e),
          is_error: true
        })
      }
    }
    messages.push({role: "user", content: toolResults})
  }
}



  


