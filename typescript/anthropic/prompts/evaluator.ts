import { writeFile, readFile } from "node:fs/promises"
import { MessageParam } from "@anthropic-ai/sdk/resources"
import { Client } from "../client"
import type { TestCase, EvalResult, RunPromptFunction } from "../types"
import type { ModelGradeResult } from "./prompts"
import { generatePromptEvaluationReport } from "./report"

const stripFences = (s: string): string =>
  s.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")

const trunc = (s: string, n: number = 60): string =>
  s.length > n ? s.slice(0, n) + "…" : s

export class PromptEvaluator {
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
  ): Promise<string[]> {
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
    [
        "Testing with technical computer science terminology",
        "Testing with medical research findings",
        "Testing with complex mathematical concepts",
        ...
    ]

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

    console.log(`[ideas] generating ${numCases} ideas...`)
    const text = await this.client.chat(messages, {systemPrompt: systemPrompt})

    const ideas: string[] = JSON.parse(stripFences(text))
    console.log(`[ideas] got ${ideas.length} ideas`)
    return ideas
  }

  // Generate a single test case for a given idea
  async generateTestCase(
    taskDescription: string,
    idea: string,
    promptInputsSpec: Record<string, string> = {}
  ): Promise<TestCase> {
    let examplePromptInputs = ""
    for (const [key, value] of Object.entries(promptInputsSpec)) {
      const val = value.replace(/\n/g, "\\n")
      examplePromptInputs += `"${key}": "EXAMPLE_VALUE", // ${val}\n`
    }

    const allowedKeys = Object.keys(promptInputsSpec)
      .map(k => `"${k}"`)
      .join(", ")

    const prompt = `
    Generate a single detailed test case for a prompt evaluation based on:

    <task_description>
    {task_description}
    </task_description>

    <specific_idea>
    {idea}
    </specific_idea>

    <allowed_input_keys>
    {allowed_keys}
    </allowed_input_keys>

    Output Format:
    {{
        "prompt_inputs": {{
        {example_prompt_inputs}
        }},
        "solution_criteria": ["criterion 1", "criterion 2", ...] // Concise list of criteria for evaluating the solution, 1 to 4 items
    }}

    IMPORTANT REQUIREMENTS:
    - You MUST ONLY use these exact input keys in your prompt_inputs: {allowed_keys}
    - Do NOT add any additional keys to prompt_inputs
    - All keys listed in allowed_input_keys must be included in your response
    - Make the test case realistic and practically useful
    - Include measurable, concise solution criteria
    - The solution criteria should ONLY address the direct requirements of the task description and the generated prompt_inputs
    - Avoid over-specifying criteria with requirements that go beyond the core task
    - Keep solution criteria simple, focused, and directly tied to the fundamental task
    - The test case should be tailored to the specific idea provided
    - Quick to solve without requiring extensive computation or multi-step processing
    - Solvable with no more than 400 tokens of output
    - DO NOT include any fields beyond those specified in the output format

    Here's an example of a sample input with an ideal output:
    <sample_input>
    <sample_task_description>
    Extract topics out of a passage of text
    </sample_task_description>
    <sample_specific_idea>
    Testing with a text that contains multiple nested topics and subtopics (e.g., a passage about renewable energy that covers solar power economics, wind turbine technology, and policy implications simultaneously)
    </sample_specific_idea>

    <sample_allowed_input_keys>
    "content"
    </sample_allowed_input_keys>
    </sample_input>
    <ideal_output>
    {
        "prompt_inputs": {
            "content": "The transition to renewable energy encompasses numerous interdependent dimensions. Solar photovoltaic technology has seen dramatic cost reductions, with panel efficiency improving 24% since 2010 while manufacturing costs declined by 89%, making it economically competitive with fossil fuels in many markets. Concurrently, wind energy has evolved through innovative turbine designs featuring carbon-fiber composite blades and advanced control systems that increase energy capture by 35% in low-wind conditions."
        },
        "solution_criteria": [
            "Includes all topics mentioned"
        ]
    }
    </ideal_output>
    This is ideal output because the solution criteria is concise and doesn't ask for anything outside of the scope of the task description.

    Ensure that the output is a valid json without backticks, comments or chain-of-thought comments.
    `

    const systemPrompt = `
    You are a test case creator specializing in designing evaluation scenarios.
    You always reply with a valid JSON without backticks, comments or chain-of-thought comments.
    `

    const renderedPrompt = this.render(prompt, {
      task_description: taskDescription,
      idea: idea,
      allowed_keys: allowedKeys,
      example_prompt_inputs: examplePromptInputs,
    })

    console.log(`[case] building: ${trunc(idea)}`)
    const text = await this.client.chat(
      [{ content: renderedPrompt, role: "user" }],
      { systemPrompt: systemPrompt, temperature: 0.7 }
    )

    const parsed = JSON.parse(stripFences(text)) as {
      prompt_inputs: Record<string, string>
      solution_criteria: string[]
    }
    console.log(`[case] built: ${trunc(idea)}`)

    return {
      scenario: idea,
      taskDescription: taskDescription,
      promptInputs: parsed.prompt_inputs,
      solutionCriteria: parsed.solution_criteria,
    }
  }

  // Grade a model's output for a test case
  async gradeOutput(
    testCase: TestCase,
    output: string,
    extraCriteria?: string
  ): Promise<ModelGradeResult> {
    let promptInputs = ""
    for (const [key, value] of Object.entries(testCase.promptInputs)) {
      const val = value.replace(/\n/g, "\\n")
      promptInputs += `"${key}":"${val}",\n`
    }

    let extraCriteriaSection = ""
    if (extraCriteria) {
      const extraCriteriaTemplate = `
      Mandatory Requirements - ANY VIOLATION MEANS AUTOMATIC FAILURE (score of 3 or lower):
      <extra_important_criteria>
      {extra_criteria}
      </extra_important_criteria>
      `
      extraCriteriaSection = this.render(extraCriteriaTemplate, {
        extra_criteria: extraCriteria,
      })
    }

    const evalTemplate = `
    Your task is to evaluate the following AI-generated solution with EXTREME RIGOR.

    Original task description:
    <task_description>
    {task_description}
    </task_description>

    Original task inputs:
    <task_inputs>
    {{ {prompt_inputs} }}
    </task_inputs>

    Solution to Evaluate:
    <solution>
    {output}
    </solution>

    Criteria you should use to evaluate the solution:
    <criteria>
    {solution_criteria}
    </criteria>

    {extra_criteria_section}

    Scoring Guidelines:
    * Score 1-3: Solution fails to meet one or more MANDATORY requirements
    * Score 4-6: Solution meets all mandatory requirements but has significant deficiencies in secondary criteria
    * Score 7-8: Solution meets all mandatory requirements and most secondary criteria, with minor issues
    * Score 9-10: Solution meets all mandatory and secondary criteria

    IMPORTANT SCORING INSTRUCTIONS:
    * Grade the output based ONLY on the listed criteria. Do not add your own extra requirements.
    * If a solution meets all of the mandatory and secondary criteria give it a 10
    * Don't complain that the solution "only" meets the mandatory and secondary criteria. Solutions shouldn't go above and beyond - they should meet the exact listed criteria.
    * ANY violation of a mandatory requirement MUST result in a score of 3 or lower
    * The full 1-10 scale should be utilized - don't hesitate to give low scores when warranted

    Output Format
    Provide your evaluation as a structured JSON object with the following fields, in this specific order:
    - "strengths": An array of 1-3 key strengths
    - "weaknesses": An array of 1-3 key areas for improvement
    - "reasoning": A concise explanation of your overall assessment
    - "score": A number between 1-10

    Respond with JSON. Keep your response concise and direct.
    Example response shape:
    {{
        "strengths": string[],
        "weaknesses": string[],
        "reasoning": string,
        "score": number
    }}

    Ensure that the output is a valid json without backticks, comments or chain-of-thought comments.
    `

    const evalPrompt = this.render(evalTemplate, {
      task_description: testCase.taskDescription ?? "",
      prompt_inputs: promptInputs,
      output: output,
      solution_criteria: testCase.solutionCriteria.join("\n"),
      extra_criteria_section: extraCriteriaSection,
    })

    console.log(`[grade] grading: ${trunc(testCase.scenario)}`)
    const evalText = await this.client.chat(
      [{ content: evalPrompt, role: "user" }],
      { temperature: 0.0 }
    )
    const grade = JSON.parse(stripFences(evalText)) as ModelGradeResult
    console.log(`[grade] score=${grade.score} for ${trunc(testCase.scenario)}`)
    return grade
  }

  // Run a single test case end-to-end: produce output, then grade it
  async runTestCase(
    testCase: TestCase,
    runPromptFunction: RunPromptFunction,
    extraCriteria?: string
  ): Promise<EvalResult> {
    console.log(`[run] running: ${trunc(testCase.scenario)}`)
    const output = await runPromptFunction(testCase.promptInputs)
    const modelGrade = await this.gradeOutput(testCase, output, extraCriteria)
    return {
      output: output,
      testCase: testCase,
      score: modelGrade.score,
      reasoning: modelGrade.reasoning,
    }
  }

  // Generate a dataset of test cases and write it to a file
  async generateDataset(
    taskDescription: string,
    promptInputsSpec: Record<string, string> = {},
    numCases: number = 1,
    outputFile: string = "dataset.json"
  ): Promise<TestCase[]> {
    console.log(`[dataset] generating ${numCases} test cases → ${outputFile}`)
    const ideas = await this.generateUniqueIdeas(
      taskDescription,
      promptInputsSpec,
      numCases
    )

    const dataset: TestCase[] = await mapWithConcurrency(
      ideas,
      this.maxConcurrentTasks,
      idea => this.generateTestCase(taskDescription, idea, promptInputsSpec)
    )

    await writeFile(outputFile, JSON.stringify(dataset, null, 2), "utf-8")
    console.log(`[dataset] wrote ${dataset.length} cases to ${outputFile}`)
    return dataset
  }

  // Run evaluation on all test cases in the dataset
  async runEvaluation(
    runPromptFunc: RunPromptFunction,
    datasetFile: string,
    extraCriteria?: string,
    jsonOutputFile: string ="output.json",
    htmlOutputFile: string ="output.html",
  ): Promise<EvalResult[]> {
    console.log(`[eval] loading dataset from ${datasetFile}`)
    const fileData = await readFile(datasetFile, "utf-8")
    const testCases: TestCase[] = JSON.parse(fileData)
    console.log(`[eval] loaded ${testCases.length} cases, running with concurrency=${this.maxConcurrentTasks}`)

    const results = await mapWithConcurrency(
      testCases,
      this.maxConcurrentTasks,
      (tc) => this.runTestCase(tc, runPromptFunc, extraCriteria)
    )

    const totalScore = results.reduce((acc, r) => acc + r.score, 0)
    const avgScore = totalScore / results.length
    console.log(`[eval] done — avg score ${avgScore.toFixed(2)} over ${results.length} cases`)

    await writeFile(jsonOutputFile, JSON.stringify(results, null, 2))
    console.log(`[eval] wrote results JSON → ${jsonOutputFile}`)

    const html = generatePromptEvaluationReport(results)
    await writeFile(htmlOutputFile, html)
    console.log(`[eval] wrote HTML report → ${htmlOutputFile}`)

    return results
  }
}

// TODO (you'll write this): run `fn` over `items` with at most `concurrency`
// in flight at a time. Return results in any order. Skip/log failures so one
// bad item doesn't tank the whole batch.
async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  // spawn concurrency workers
  let cursor = 0
  const results: R[] = []

  const worker = async () => {
    while (true) {
      const i = cursor++
      if (i >= items.length) return // end of queue

      try {
        const result = await fn(items[i], i)
        results.push(result)
      } catch (e) {
        console.error(`item ${i} error: ${e}`)
      }
    }
  }

  // constructs an array of 3 workers
  // workers know then they are done thanks to cursor
  const workers = Array.from({length: Math.min(concurrency, items.length)}, () => worker())
  await Promise.all(workers)

  return results
}