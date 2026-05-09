import { Anthropic } from "@anthropic-ai/sdk"
import {
  getCurrentDatetimeSchema,
  addDurationToDateSchema,
  setReminderSchema
} from "../anthropic/tools/schemas"
import { MessageParam, Message } from "@anthropic-ai/sdk/resources"
import {
  getCurrentDatetime,
  addDurationToDate,
  AddDurationToDateParams,
  setReminder,
  SetReminderParams
} from "../anthropic/tools/tools"
import { textFromMessage } from "../anthropic/helpers"

const client = new Anthropic()

const convoResult = await runConversation(client, "Set a reminder about my London trip that is 7 days away from now. Return the reminder JSON string back to me so that a different agent can push it to my calendar. Return a valid json without comments, backticks or annotations.")
console.log("convo res:")
console.log(textFromMessage(convoResult))

async function runConversation(client: Anthropic, initialMessage: string): Promise<Message> {
  const messages: MessageParam[] = [{role: "user", content: initialMessage}]
 
  while (true) {
    const resp = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: messages,
      tools: [getCurrentDatetimeSchema, addDurationToDateSchema, setReminderSchema]
    })
    console.log("assitant responded:", textFromMessage(resp))
    console.log("stop_reason:", resp.stop_reason)

    if (resp.stop_reason !== "tool_use") {
      // end of the road mate
      return resp
    }
    messages.push({role: "assistant", content: resp.content})

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of resp.content) {
      if (block.type !== "tool_use") continue

      console.log(`-> tool call: ${block.name}`, JSON.stringify(block.input))

      try {
        const result = runTool(block.input, block.name)
        console.log(`<- tool result (${block.name}):`, result)
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
          is_error: false
        })
      } catch (e) {
        console.log(`<- tool ERROR (${block.name}):`, String(e))
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
    case "setReminder": {
      const input = toolInput as SetReminderParams
      return JSON.stringify(setReminder(input))
    }
    default: {
      throw new Error(`unexpected tool: ${toolName}`)
    }
  }
}



  


