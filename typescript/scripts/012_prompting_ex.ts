import { PromptEvaluator } from "../anthropic/prompts/evaluator";
import { Client } from "../anthropic/client";
import { MessageParam } from "@anthropic-ai/sdk/resources";

const client = new Client("claude-haiku-4-5", 1000)
const evaluator = new PromptEvaluator(1, client)
const datasetFile = "scripts/prompting-ex/prompting_data.json"

const args = process.argv.slice(2)
console.group("running with args:", args) 
await main(args[0] === "y")



async function main(
  isDatasetGetNeeded: boolean
) {

  if (isDatasetGetNeeded) {
    await evaluator.generateDataset(
      "Extract topics out of a passage text from a scholarly article into a JSON array on strings",
      {
        "content": "One paragraph of text from a scholarly journal written in English",
      },
      4,
      datasetFile
    )
  } 

  const results = evaluator.runEvaluation(
    runPrompt,
    datasetFile,
    `
    - Contains a JSON array of strings, containing each topic mentioned in the article.
    - The strings should contain only a topic without any extra commentary.
    - Response should the JSON array and NOTHING else.
    `,
    "scripts/prompting-ex/out.json",
    "scripts/prompting-ex/out.html"
  )
}





async function runPrompt(promtInputs: Record<string, string>): Promise<string> {
  const prompt = `
  What topics are in here?

  ${promtInputs.content}
  `

  const messages: MessageParam[] = [
    {
      content: prompt,
      role: "user"
    }
  ]

  return await client.chat(messages)
}
