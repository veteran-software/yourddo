import type { DateTime } from 'luxon'

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export const formatDateWithOrdinal = (date: DateTime): string => {
  const weekday = date.toFormat('cccc') // e.g. Monday
  const month = date.toFormat('LLLL') // e.g. July
  const day = date.day
  const year = date.year
  const ordinalDay = `${String(day)}${getOrdinalSuffix(day)}`

  return `${weekday}, ${month} ${ordinalDay}, ${String(year)}`
}
