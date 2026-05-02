import { PromptEvaluator } from "../anthropic/prompts/evaluator";
import { Client } from "../anthropic/client";
import { MessageParam } from "@anthropic-ai/sdk/resources";

const client = new Client("claude-haiku-4-5", 1000)
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


  <athlete_information>
  - Height: ${promtInputs.height}
  - Weight: ${promtInputs.weight}
  - Goal: ${promtInputs.goal}
  - Dietary restrictions: ${promtInputs.restrictions}
  </athlete_information>

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

  Here is an example with a sample input and an ideal output
  <sample_input>
    height: 155
    weight: 50
    goal: Training for a marathon
    restrictions: Vegan
  </sample_input>

  <ideal_output>
    # Marathon Training Nutrition Plan
    **For 155cm, 50kg Vegan Athlete**

    ---

    ## Daily Calorie & Macronutrient Targets

    **Daily Calories:** 2,400-2,600 kcal
    *(Base metabolic rate ~1,400 + marathon training ~1,000-1,200)*

    **Macronutrient Breakdown:**
    - **Protein:** 95-110g (16-17%)
    - **Carbohydrates:** 330-360g (55-56%)
    - **Fat:** 65-75g (25-28%)

    ---

    ## Daily Meal Plan

    ### **BREAKFAST** (7:00 AM)
    *Before morning runs*
    - Oatmeal: 60g dry
    - Banana: 120g
    - Almond butter: 20g
    - Plant-based milk: 240ml

    **Calories: 520 | Protein: 15g | Carbs: 75g | Fat: 16g**

    ---

    ### **MID-MORNING SNACK** (10:00 AM)
    - Whole grain toast: 50g
    - Hummus: 40g
    - Cherry tomatoes: 80g

    **Calories: 240 | Protein: 8g | Carbs: 28g | Fat: 10g**

    ---

    ### **LUNCH** (1:00 PM)
    - Brown rice: 80g cooked
    - Cooked lentils: 100g
    - Roasted vegetables (broccoli, sweet potato): 200g
    - Tahini dressing: 15g

    **Calories: 520 | Protein: 18g | Carbs: 80g | Fat: 12g**

    ---

    ### **PRE-WORKOUT SNACK** (3:30 PM)
    *1-2 hours before evening run*
    - Dates: 60g (about 4-5)
    - Cashews: 20g

    **Calories: 280 | Protein: 6g | Carbs: 40g | Fat: 12g**

    ---

    ### **DINNER** (7:00 PM)
    *After evening workout (within 30-45 min for recovery)*
    - Chickpea pasta: 90g dry (cooked)
    - Marinara sauce: 150g
    - Spinach: 80g
    - Nutritional yeast: 10g
    - Olive oil: 10ml

    **Calories: 490 | Protein: 22g | Carbs: 70g | Fat: 12g**

    ---

    ### **EVENING RECOVERY SNACK** (9:00 PM)
    - Plant-based Greek yogurt: 150g
    - Granola: 30g
    - Blueberries: 60g

    **Calories: 240 | Protein: 15g | Carbs: 32g | Fat: 5g**

    ---

    ## **Daily Totals**
    - **Calories: 2,490**
    - **Protein: 84g** ✓ (meets requirement; add 10-15g more via extra snack if needed)
    - **Carbs: 325g**
    - **Fat: 67g**

    ---

    ## **Key Protein Sources (Vegan)**
    - Lentils, chickpeas, black beans
    - Tofu (150g = 15g protein)
    - Tempeh (100g = 19g protein)
    - Hemp seeds (20g = 10g protein)
    - Plant-based protein powder
    - Nutritional yeast (10g = 8g protein)

    ---

    ## **Hydration**
    - **Daily:** 2.5-3L water
    - **During long runs:** 500-750ml per hour

    ---

    ## **Budget-Friendly Tips**
    ✓ Buy dried beans/lentils in bulk  
    ✓ Use seasonal vegetables  
    ✓ Buy oats & rice in bulk  
    ✓ Skip specialty products; whole foods are cheaper

    **Estimated weekly cost: $35-50 USD**
  </ideal_output>
  This solution successfully fulfills all three mandatory requirements with a comprehensive 1-day meal plan including breakfast, lunch, dinner, and multiple snacks; all meals are dairy-free and nut-free; and protein content is exceptionally high for muscle gain. However, the caloric surplus exceeds recommendations and macronutrient percentages deviate from stated targets. The presentation also violates the 'compact concise' specification with supplementary content and an incomplete ending. Despite these secondary issues, the core meal plan is well-structured, properly timed around workouts, and meets all mandatory criteria.
  `

  const messages: MessageParam[] = [
    {
      content: prompt,
      role: "user"
    }
  ]

  return await client.chat(messages)
}
