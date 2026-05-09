
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


const defaultDatetimeFormat = "EEEE, MMMM dd, yyyy hh:mm:ss a"

export function getCurrentDatetime(dateFormat=defaultDatetimeFormat): string {
  if (dateFormat.length === 0) {
    throw new Error(`${dateFormat} is an empty string`)
  }
  return format(new Date(), dateFormat)
}

export interface AddDurationToDateParams {
  datetimeStr: string;
  duration?: number;
  unit?: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";
  inputFormat?: string;
}

export function addDurationToDate(
  {
    datetimeStr,
    duration = 0,
    unit = "days",
    inputFormat
  }: AddDurationToDateParams
): string {

  const inputFormatOrDefault = inputFormat && inputFormat.length > 0 ? inputFormat : defaultDatetimeFormat

  const parsedDate = parse(datetimeStr, inputFormatOrDefault, new Date())
  if (!isValid(parsedDate)) {
    throw new Error(`could not parse ${datetimeStr} with format ${inputFormatOrDefault}`)
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
  return format(newDate, defaultDatetimeFormat)
}