export interface TestCase {
  scenario: string
  promptInputs: Record<string, string>
  solutionCriteria: string[]
}

export interface EvalResult {
  output: string
  testCase: TestCase
  score: number
  reasoning: string
}
