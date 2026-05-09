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
    console.log("assitant responded:", textFromMessage(resp))
    
    if (resp.stop_reason !== "tool_use") {
      // end of the road mate
      return resp
    }
    messages.push({role: "assistant", content: resp.content})

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of resp.content) {
      if (block.type !== "tool_use") continue

      try {
        const result = runTool(block.input, block.name)
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

function runTool(toolInput: unknown, toolName: string): string {
  switch (toolName) {
    case "getCurrentDatetime": {
      const input = toolInput as {dateFormat?: string}
      return getCurrentDatetime(input.dateFormat)
    }
    case "addDurationToDate": {
      const input = toolInput as AddDurationToDateParams
      return addDurationToDate(input)
    }
    default: {
      throw new Error(`unexpected tool: ${toolName}`)
    }
  }
}



  


