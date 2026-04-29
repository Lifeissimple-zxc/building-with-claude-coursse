import { MessageParam } from "@anthropic-ai/sdk/resources"
import { Client } from "../client"

class PromptEvaluator {
  maxConcurrentTasks: number
  client: Client

  constructor(maxConcurrentTasks: number, client: Client) {
    this.maxConcurrentTasks = maxConcurrentTasks
    this.client = client
  }

  render(templateString: string, variables: Record<string, unknown>): string {
    const placeholders = templateString.match(/{([^{}]+)}/g) ?? []

    let result = templateString
    for (const match of placeholders) {
      const name = match.slice(1, -1)
      if (name in variables) {
        result = result.split(match).join(String(variables[name]))
      }
    }

    return result.replace(/{{/g, "{").replace(/}}/g, "}")
  }

  // Generate a list of unique ideas for test cases based on the task description
  async generateUniqueIdeas(
    taskDescription: string, 
    promptInputsSpec: Record<string, string>, 
    numCases: number
  ): Promise<string> {
    const prompt = `
    Generate {num_cases} unique, diverse ideas for testing a prompt that accomplishes this task:

    <task_description>
    {task_description}
    </task_description>

    The prompt will receive the following inputs
    <prompt_inputs>
    {prompt_inputs_spec}
    </prompt_inputs>

    Each idea should represent a distinct scenario or example that tests different aspects of the task.

    Output Format:
    Provide your response as a structured JSON array where each item is a brief description of the idea.

    Example:
    \`\`\`json
    [
        "Testing with technical computer science terminology",
        "Testing with medical research findings",
        "Testing with complex mathematical concepts",
        ...
    ]
    \`\`\`

    Ensure each idea is:
    - Clearly distinct from the others
    - Relevant to the task description
    - Specific enough to guide generation of a full test case
    - Quick to solve without requiring extensive computation or multi-step processing
    - Solvable with no more than 400 tokens of output

    Remember, only generate {num_cases} unique ideas.
    Ensure that the output is a valid json without backticks, comments or chain-of-thought comments.
    `

    const systemPrompt = `
    You are a test scenario designer specialized in creating diverse, unique testing scenarios.
    You always reply with a valid JSON without without backticks, comments or chain-of-thought comments.
    `

    let examplePromptInputs = ""
    for (const [key, value] of Object.entries(promptInputsSpec)) {
      const val = value.replace(/\n/g, "\\n")
      examplePromptInputs += `"${key}": str # ${val},`
    }

    const renderedPrompt = this.render(prompt, {
      num_cases: numCases,
      task_description: taskDescription,
      prompt_inputs_spec: examplePromptInputs,
    })

    const messages: MessageParam[] = []

    messages.push({content: renderedPrompt, role: "user"})

    const text = await this.client.chat(messages, {systemPrompt: systemPrompt})

    return JSON.parse(text)
  }
}