import { spawnSync } from "node:child_process"

export type Format = "json" | "python" | "regex"


export function validatePython(s: string): number {
  const result = spawnSync(
    "python",
    ["-c", "import ast, sys; ast.parse(sys.stdin.read())"],
    { input: s, encoding: "utf8" },
  )
  if (result.error) throw result.error
  return result.status === 0 ? 10 : 0
}

export function validateJSON(s: string): number {
  try {
    JSON.parse(s)
    return 10
  } catch (e) {
    return 0
  }
}

export function validateRegex(s: string): number {
  try {
    new RegExp(s)
    return 10
  } catch (e) {
    return 0
  }
}

export function validateOutput(s: string, format: Format): number {
  switch (format) {
    case "json": return validateJSON(s)
    case "python": return validatePython(s)
    case "regex": return validateRegex(s)
  }
}