export interface ModelGradeResult {
  strenghts: string[]
  weaknesses: string[]
  reasoning: string
  score: number
}


export function getJudgeSystemPrompt(task: string, output: string, solutionCriteria: string): string {
  return `
  You are an expert AWS code reviewer. Your task is to evaluate the following AI-generated solution.

  Original Task:
  <task>${task}</task>

  Solution to Evaluate:
  <solution>${output}</solution>
  Output Format
  Provide your evaluation as a structured JSON object with the following fields, in this specific order:
  - "strengths": An array of 1-3 key strengths
  - "weaknesses": An array of 1-3 key areas for improvement
  - "reasoning": A concise explanation of your overall assessment
  - "score": A number between 1-10 based on how closely the output is aligned with the task's success criteria:
  <solutionCriteria>${solutionCriteria}</solutionCriteria>.

  Respond with JSON. Keep your response concise and direct.
  Example response shape:
  {
    "strengths": string[],
    "weaknesses": string[],
    "reasoning": string,
    "score": number
  }
  Only return JSON in your response. Do not include backticks, comments or anything else. Your response has to be parsable with JSON.parse.
  `
}

