import { readFile } from "node:fs/promises"
import { Client } from "../anthropic/client.js"
import { Anthropic } from "@anthropic-ai/sdk"
import { getJudgeSystemPrompt, ModelGradeResult } from "../anthropic/prompts/prompts.js"
import { validateOutput, type Format } from "../anthropic/validation/validation.js"

interface Task {
  task: string
  format: Format
}

interface EvalResult {
  output: string
  testCase: string
  score: number
  reasoning: string
}

const client = new Client(
  new Anthropic(),
  "claude-sonnet-4-5",
  1000,
)

const getPrompt = (task: string) => {
  return `
  Please provide a solution to the following task:\n${task}
  
  * respond only with Python, JSON or a plain Regex.
  * do not include comments, backticks, markup or anything else.
  * the output needs to be a valid expression parsable by python's ast, JSON serialiser or a regex engine.
  `
}

async function gradeWithModel(testCase: string, output: string): Promise<ModelGradeResult> {
  const gradingPrompt = getJudgeSystemPrompt(testCase, output)
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
  console.log(`graded ${testCase}`)
  console.log(gradeResult)

  return gradeResult
}

async function runTestCase(testCase: string, format: Format): Promise<EvalResult> {
  console.log(`evaling testcase ${testCase}`)
  const output = await client.chat(
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
  
  // TODO grading
  const modelGradeResult = await gradeWithModel(testCase, output)
  const syntaxScore = validateOutput(output, format)
  const score = (modelGradeResult.score + syntaxScore) / 2
  
  return {
    output: output,
    testCase: testCase,
    score: score,
    reasoning: modelGradeResult.reasoning
  }
}

async function runEvals(tasks: Task[]): Promise<EvalResult[]> {
  return Promise.all(tasks.map(t => runTestCase(t.task, t.format)))
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
console.log(evalResults)

const totalScore = evalResults.reduce((acc, r) => acc + r.score, 0)
console.log("average score", totalScore / evalResults.length)

