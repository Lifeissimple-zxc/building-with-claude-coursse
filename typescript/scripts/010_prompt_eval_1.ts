import { MessageParam } from "@anthropic-ai/sdk/resources"
import { readFile } from "node:fs/promises"
import { ClientWithMessageHistory } from "../anthropic/client.js"
import { Anthropic } from "@anthropic-ai/sdk"

interface Task {
  task: string
}

interface EvalResult {
  output: string
  testCase: string
  score: number
}

const client = new ClientWithMessageHistory(
  new Anthropic(),
  "claude-sonnet-4-5",
  1000,
)

const getPrompt = (task: string) => {
  return `Please provide a solution to the following task:\n${task}`
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
  const score = 10
  
  return {
    output: output,
    testCase: testCase,
    score: score
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

