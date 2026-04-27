import { Anthropic } from "@anthropic-ai/sdk"
import { Client } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"                                                           

const client = new Client(
  new Anthropic(),
  "claude-haiku-4-5-20251001",
  1000,
)

const msg = "Generate a very short event bridge rule as JSON"
const responseMessage = await client.chat(
  [
    { role: "user", content: msg },
    { role: "assistant", content: "```json" },
  ],
  { stopSequences: ["```"] },
)

console.log(responseMessage)
