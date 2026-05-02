import { Client } from "../anthropic/client.js"

const client = new Client("claude-sonnet-4-6", 500)

const msg = "Generate a one sentence movie idea"
const respHighTemp = await client.chat(
  [{ role: "user", content: msg }],
  { temperature: 100 },
)
console.log("High temp")
console.log(respHighTemp)

console.log("--")
console.log("Low temp")
const respLowTemp = await client.chat(
  [{ role: "user", content: msg }],
  { temperature: 0 },
)
console.log(respLowTemp)

