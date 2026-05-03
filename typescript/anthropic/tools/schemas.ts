import Anthropic from "@anthropic-ai/sdk"

export const addDurationToDateSchema: Anthropic.Tool = {
  "name": "getCurrentDatetime",
  "description": "Returns the current date and time formatted according to the specified format string.",
  "input_schema": {
    "type": "object",
    "properties": {
      "dateFormat": {
        "type": "string",
        "description": "The date-time format string (e.g. \"yyyy-MM-dd HH:mm:ss\"). Must be non-empty.",
        "minLength": 1
      }
    },
    "required": []
  }
}

export const addDurationDateSchema: Anthropic.Tool = {
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