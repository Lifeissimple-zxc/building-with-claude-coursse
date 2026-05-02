import { PromptEvaluator } from "../anthropic/prompts/evaluator";
import { Client } from "../anthropic/client";
import { MessageParam } from "@anthropic-ai/sdk/resources";

const client = new Client("claude-sonnet-4-5", 1000)
const evaluator = new PromptEvaluator(1, client)
const datasetFile = "scripts/prompting/prompting_data.json"

const args = process.argv.slice(2)
console.group("running with args:", args) 
await main(args[0] === "y")



async function main(
  isDatasetGetNeeded: boolean
) {

  if (isDatasetGetNeeded) {
    await evaluator.generateDataset(
      "Write a compact concise 1 day meal plan for a single athlete",
      {
        "height": "Athlete's height in cm",
        "weight": "Athlete's weight in kg",
        "goal": "Goal of the athlene",
        "restrictions": "Athlete's dietary restrictions"
      },
      4,
      datasetFile
    )
  } 

  const results = evaluator.runEvaluation(
    runPrompt,
    datasetFile,
    `The output should include:
    - Daily caloric total
    - Macronutrient breakdown
    - Meals with exact foods, portions and timing
    `,
    "scripts/prompting/out.json",
    "scripts/prompting/out.html"
  )
}





async function runPrompt(promtInputs: Record<string, string>): Promise<string> {
  const prompt = `
  What should this person eat?

  - Height: ${promtInputs.height}
  - Weight: ${promtInputs.weight}
  - Goal: ${promtInputs.goal}
  - Dietary restrictions: ${promtInputs.restrictions}

  Guidelines:
  1. INclude accurate daily calorie amount.
  2. Show protein, fat and carb amounts.
  3. Specify when to eat each meal.
  4. Use only foods that fit restrictions.
  5. List all portion sizes in grams.
  6. Keep budget-friendly if requested.

  Follow these steps:
  1. Calculate daily calories needed.
  2. Figure out protein, fat and carb amounts.
  3. Plan meal timing around workouts.
  4. Choose foods that fit restrictions.
  5. Set portion sizes in grams.
  6. Adjust for budget if needed.
  `

  const messages: MessageParam[] = [
    {
      content: prompt,
      role: "user"
    }
  ]

  return await client.chat(messages)
}
