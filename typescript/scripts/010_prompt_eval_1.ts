import { readFile } from "node:fs/promises"
import { Client } from "../anthropic/client"
import { getJudgeSystemPrompt, ModelGradeResult } from "../anthropic/prompts/prompts"
import { validateOutput, type Format } from "../anthropic/validation/validation"
import type { EvalResult } from "../anthropic/types"

interface Task {
  task: string
  format: Format
  solutionCriteria: string
}

const newClient = () => new Client("claude-sonnet-4-5", 1000)

const getPrompt = (task: string) => {
  return `
  Please provide a solution to the following task:\n${task}
  
  * respond only with Python, JSON or a plain Regex.
  * do not include comments, backticks, markup or anything else.
  * the output needs to be a valid expression parsable by python's ast, JSON serialiser or a regex engine.
  `
}

async function gradeWithModel(
  client: Client,
  testCase: string,
  output: string,
  successCriteria: string
): Promise<ModelGradeResult> {
  const gradingPrompt = getJudgeSystemPrompt(testCase, output, successCriteria)
  const resp = await client.chat(
    [
      {
        content: gradingPrompt,
        role: "user"
      }
    ], 
    {
      systemPrompt: `
      Strictly follow the user's format.
      You have to respond with a JSON adherent to the following format: 
      {
        "strengths": string[],
        "weaknesses": string[],
        "reasoning": string,
        "score": number
      }
      Client computer will blow up if you don't follow the format requirement. Be careful!
      Only return JSON in your response. Do not include backticks, comments or anything else. Your response has to be parsable with JSON.parse.
      `
    }
  )

  const gradeResult: ModelGradeResult = JSON.parse(resp)
  return gradeResult
}

async function runTestCase(testCase: string, format: Format, successCriteria: string): Promise<EvalResult> {
  console.log(`evaling testcase ${testCase}`)
  const taskClient = newClient()
  const output = await taskClient.chat(
    [
      {
        content: getPrompt(testCase),
        role: "user"
      }
    ],
    {systemPrompt: `
      respond only with python, json or a regex expression. The response should always be a valid form of one of the three.
      Do not include comments, explanation, backticks or reasoning.
    `}
  )
  
  const modelGradeResult = await gradeWithModel(newClient(), testCase, output, successCriteria)
  const syntaxScore = validateOutput(output, format)
  const score = (modelGradeResult.score + syntaxScore) / 2
  
  return {
    output: output,
    testCase: {
      scenario: testCase,
      promptInputs: { task: testCase },
      solutionCriteria: [successCriteria]
    },
    score: score,
    reasoning: modelGradeResult.reasoning
  }
}

async function runEvals(tasks: Task[]): Promise<EvalResult[]> {
  return Promise.all(tasks.map(t => runTestCase(t.task, t.format, t.solutionCriteria)))
}

const text = await readFile("data/tasks.json", "utf-8")
console.log("loaded file")
const tasks: Task[] = JSON.parse(text)
console.log(`${tasks.length} task(s) found`)


// eval loop
console.log("starting eval loop")
console.log("################################")

const evalResults = await runEvals(tasks)
console.log("evals completed")

const totalScore = evalResults.reduce((acc, r) => acc + r.score, 0)
console.log("average score", totalScore / evalResults.length)

