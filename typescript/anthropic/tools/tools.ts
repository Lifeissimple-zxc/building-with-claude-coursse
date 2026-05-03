import Anthropic from "@anthropic-ai/sdk"
import {
  parse,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addYears,
  addMonths,
  isValid,
  format
} from "date-fns"

export const addDurationDateTool: Anthropic.Tool = {
  "name": "add_duration_to_datetime",
  "description": "Adds a specified duration to a datetime string and returns the resulting datetime in a detailed format. This tool converts an input datetime string to a Python datetime object, adds the specified duration in the requested unit, and returns a formatted string of the resulting datetime. It handles various time units including seconds, minutes, hours, days, weeks, months, and years, with special handling for month and year calculations to account for varying month lengths and leap years. The output is always returned in a detailed format that includes the day of the week, month name, day, year, and time with AM/PM indicator (e.g., 'Thursday, April 03, 2025 10:30:00 AM').",
  "input_schema": {
      "type": "object",
      "properties": {
          "datetimeStr": {
              "type": "string",
              "description": "The input datetime string to which the duration will be added. This should be formatted according to the input_format parameter.",
          },
          "duration": {
              "type": "number",
              "description": "The amount of time to add to the datetime. Can be positive (for future dates) or negative (for past dates). Defaults to 0.",
          },
          "unit": {
              "type": "string",
              "description": "The unit of time for the duration. Must be one of: 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', or 'years'. Defaults to 'days'.",
          },
          "inputFormat": {
              "type": "string",
              "description": "The format string for parsing the input datetime_str, using Python's strptime format codes. For example, '%Y-%m-%d' for ISO format dates like '2025-04-03'. Defaults to '%Y-%m-%d'.",
          },
      },
      "required": ["datetimeStr"],
  },
}

export function addDurationToDate(
  datetimeStr: string,
  duration: number,
  unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years",
  inputFormat = "yyyy-MM-dd"
): string {

  const parsedDate = parse(datetimeStr, inputFormat, new Date())
  if (!isValid(parsedDate)) {
    throw new Error(`could not parse ${datetimeStr} with format ${inputFormat}`)
  }

  const newDateProvider = () => {
    switch (unit) {
    case "seconds":
      return addSeconds(parsedDate, duration)
    case "minutes":
      return addMinutes(parsedDate, duration)
    case "hours":
      return addHours(parsedDate, duration)
    case "days":
      return addDays(parsedDate, duration)
    case "weeks":
      return addWeeks(parsedDate, duration)
    case "months":
      return addMonths(parsedDate, duration)
    case "years":
      return addYears(parsedDate, duration)
    }
  }

  const newDate = newDateProvider()
  return format(newDate, "EEEE, MMMM dd, yyyy hh:mm:ss a")
}