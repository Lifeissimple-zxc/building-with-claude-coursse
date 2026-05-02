import { Client } from "../anthropic/client.js"

const client = new Client("claude-sonnet-4-6", 1000)

const responseMessage = await client.chat(
  [
    { role: "user", content:
          "Generate a very short EventBridge rule.\n\n" +
          "Return ONLY the JSON object. No prose, no markdown, no code fences. " +
          "Your entire response must parse as JSON.", },
  ],
  { systemPrompt: "You output strict JSON. Every response is a single valid JSON value with nothing before or after it. Output must parse with JSON.parse." },
)

console.log("message")
console.log(responseMessage)

console.log("################")
console.log("parsed json")
const generatedJSONObject = JSON.parse(responseMessage)
console.log(generatedJSONObject)
