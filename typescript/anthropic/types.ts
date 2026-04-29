export interface TestCase {
  scenario: string
  promptInputs: Record<string, string>
  solutionCriteria: string[]
  taskDescription?: string
}

export interface EvalResult {
  output: string
  testCase: TestCase
  score: number
  reasoning: string
}

export type RunPromptFunction = (promptInputs: Record<string, string>) => Promise<string>
