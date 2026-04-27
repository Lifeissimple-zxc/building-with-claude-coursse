import { MessageParam } from "@anthropic-ai/sdk/resources"
import { readFile } from "node:fs/promises"
import { Client } from "../anthropic/client.js"
import { Anthropic } from "@anthropic-ai/sdk"
import { getJudgeSystemPrompt, ModelGradeResult } from "../anthropic/prompts/prompts.js"

interface Task {
  task: string
}

interface EvalResult {
  output: string
  testCase: string
  score: number
}

const client = new Client(
  new Anthropic(),
  "claude-sonnet-4-5",
  1000,
)

const getPrompt = (task: string) => {
  return `Please provide a solution to the following task:\n${task}`
}

async function gradeWithModel(testCase: string, output: string): Promise<number> {
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

  console.log(`response for ${testCase}: ${resp}`)
  const gradeResult: ModelGradeResult = JSON.parse(resp)
  console.log(`graded ${testCase}`)
  console.log(gradeResult)

  return gradeResult.score
}

async function runTestCase(testCase: string): Promise<EvalResult> {
  // get response from claude
  console.log(`evaling testcase ${testCase}`)
  const output = await client.chat(
    [
      {
        content: getPrompt(testCase),
        role: "user"
      }
    ]
  )
  // TODO grading
  const modelScore = await gradeWithModel(testCase, output)
  
  return {
    output: output,
    testCase: testCase,
    score: modelScore
  }
}

async function runEvals(tasks: Task[]): Promise<EvalResult[]> {
  return Promise.all(tasks.map(t => runTestCase(t.task)))
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

