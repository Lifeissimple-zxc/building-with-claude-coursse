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
  Read the content and extract the topics from it into a JSON array of strings.

  Guidelines:
  1. Gather the context by reading the content.
  2. Locate the main topics of the article.
  3. Write the topics to a JSON array and return it back to the caller.

  Output format:
  [
    "topic1",
    "topic2",
    "..."
  ]

  Here is an example with an ideal input mapped to its ideal output.
  <input_example>
  The phenomenological approach to consciousness interrogates the relationship between subjective experience and ontological presence, challenging the Cartesian dichotomy that privileges mental substance over material instantiation. Heidegger's conception of Being-in-the-world dissolves the subject-object binary by positing that consciousness is fundamentally constituted through its embeddedness in practical engagement with entities. This framework implicitly addresses questions of intentionality, the nature of temporal experience, and the constitution of meaning through intersubjective relations. The critique of representationalism embedded within this trajectory suggests that knowledge does not arise from internal mental representations corresponding to external reality, but rather through a primordial openness to the disclosure of beings. Contemporary phenomenological investigations extend these insights to examine how embodied practices structure perception and how the lifeworld serves as the prereflective ground for all theoretical knowledge claims.
  </input_example>

  <ideal_output>
  [
    "Phenomenology",
    "Consciousness",
    "Subjective experience",
    "Ontological presence",
    "Cartesian dualism",
    "Being-in-the-world",
    "Subject-object relations",
    "Intentionality",
    "Temporal experience",
    "Intersubjectivity",
    "Representationalism",
    "Embodied practices",
    "Perception",
    "Lifeworld"
  ]
  </ideal_output>

  The output is ideal because the solution fully satisfies all mandatory requirements by providing only a properly formatted JSON array of strings with no extra commentary. It meets all secondary criteria by identifying both explicit and implicit topics, maintaining appropriate granularity, and capturing the core philosophical concerns of the passage. The extraction demonstrates strong comprehension of the phenomenological concepts discussed.
  <content>
  ${promtInputs.content}
  </content>
  `

  const messages: MessageParam[] = [
    {
      content: prompt,
      role: "user"
    }
  ]

  return await client.chat(messages)
}
