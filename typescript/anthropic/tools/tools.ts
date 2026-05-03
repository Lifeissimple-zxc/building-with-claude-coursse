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

export function addDurationToDate(
  dateStr: string,
  duration: number,
  unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years",
  inputFormat = "yyyy-MM-dd"
): string {

  const parsedDate = parse(dateStr, inputFormat, new Date())
  if (!isValid(parsedDate)) {
    throw new Error(`could not parse ${dateStr} with format ${inputFormat}`)
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