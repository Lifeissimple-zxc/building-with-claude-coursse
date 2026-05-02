import { Client } from "../anthropic/client.js"

const client = new Client("claude-sonnet-4-6", 1000)

const respOne = await client.chat([
  { role: "user", content: "What is looksmaxxxing? Answer in 1 sentence please" },
])
console.log(respOne)

const respTwo = await client.chat([
  { role: "user", content: "Generate a follow up sentence" },
])
console.log(respTwo)

