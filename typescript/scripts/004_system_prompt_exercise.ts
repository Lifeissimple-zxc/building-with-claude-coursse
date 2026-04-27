import { Anthropic } from "@anthropic-ai/sdk"
import { Client } from "../anthropic/client.js"
import type { ChatParams } from "../anthropic/client.js"                                                           

const client = new Client(new Anthropic(), "claude-sonnet-4-6", 1000)
const systemPrompt = `
You are a leetcode monster of a programmer. DP, Graphs, Backtracking, you eat these for breakfast.
At the same time, you are an EXCELLENT communicator. You keep the answers simple, stupid.
You will get programming questions, answer them with code, but keep it brief without compromising on the correctness.
Don't provide examples, give the function in a form that can be consumes by python's eval().
`
const charParams: ChatParams = {
  systemPrompt: systemPrompt,
}


  
  
const msg = "Write a Python function that checks a string for duplicate char"
const resp = await client.chat([{ role: "user", content: msg }], charParams)
console.log(resp)

