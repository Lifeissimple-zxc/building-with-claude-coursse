import { Anthropic } from "@anthropic-ai/sdk"
import { Client } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"                                                           

const client = new Client(
  new Anthropic(),
  "claude-sonnet-4-6",
  1000,
)

const msg = "Generate 5-10 movie recommendations for someone who likes Ari Aster."
console.log("Streaming starts now!")
const respHighTemp = await client.stream([{ role: "user", content: msg }])

console.log()

console.log("Final response:")
console.log(respHighTemp)

