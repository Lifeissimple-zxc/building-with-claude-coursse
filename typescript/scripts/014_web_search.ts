import { Anthropic } from "@anthropic-ai/sdk"
import { MessageParam, Message } from "@anthropic-ai/sdk/resources"
import { textFromMessage } from "../anthropic/helpers"

const client = new Anthropic()

const messages: MessageParam[] = [
  {role: "user", content: "what are the latest gen alpha memes"}
]

const resp = await client.messages.create(
  {
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: messages,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5 
      }
    ]
  }
)

console.log(resp)





  


