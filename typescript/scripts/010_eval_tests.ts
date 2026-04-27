import { Anthropic } from "@anthropic-ai/sdk"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import { writeFile } from "node:fs/promises"

const client = new ClientWithMessageHistory(
  new Anthropic(),
  "claude-sonnet-4-5",
  1000,
)

const prompt = `
Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate prompts
that generate Python, JSON, Regex specifically for AWS-related tasks. Generate an array of JSON objects
each representing task that requires Python, JSON or a Regex to complete.

Example output:
[
  {"task": "Description of task"},
  ...additional
]

* Focus on tasks that can be solved by writing a single Python function, a single JSON or a Regex.
* Focus on tasks that DO NOT require writing much code.

Please generate 3 objects.

The response has to be a valid json so that it can be successfully parsed with node's JSON.parse api.
DO NOT include comments, backticks or anything that can break the object parsing.
`

const systemPrompt = "Return a valid json, DO NOT include comments, backticks or anything that can break the object parsing"
const responseMessage = await client.chat(
  [
    {
      role: "user",
      content: prompt,
    },
  ],
  {"systemPrompt": systemPrompt}
)

const parsedResponse = JSON.parse(responseMessage)

await writeFile("data/tasks.json", JSON.stringify(parsedResponse, null, 4), "utf8")
