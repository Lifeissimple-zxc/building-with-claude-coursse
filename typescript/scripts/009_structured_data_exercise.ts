import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"                                                  
import { rootCertificates } from "node:tls"

const client = new ClientWithMessageHistory(
  new Anthropic(),
  "claude-sonnet-4-6",
  1000,
)

const prompt = "Generate three different sample AWS CLI commands. Each should be very short."
const formatPrompt = "The commands have to be short. There must not be any comments or explanation. The command list need to be ready to be pasted to the AWS CLI without any string processing."
const responseMessage = await client.chat(
  [
    {
      role: "user",
      content: prompt,
    },
  ],
  {"systemPrompt": "Return only commands, each on a separate line. No formatting or comments."}
)

console.log(responseMessage)