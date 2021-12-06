import moment from 'moment'

import { ONE_DAY } from '../const'

/**
 * Converts a date to a comparable number (e.g. 20210911)
 *
 * @param v {Date|number|moment|object}
 * @returns number
 */
function toComparableDate(v) {
  let date
  if (v instanceof Date) {
    date = v
  } else if (typeof v === 'number') {
    date = new Date(v)
  } else if (v instanceof moment) {
    date = v.toDate()
  } else {
    date = new Date(v.date ? v.date : v.datetime)
  }
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  // Don't forget, month is 0 indexed for whatever reason
  return (y * 10000) + ((m + 1) * 100) + d
}

export function dgt(a, b) {
  return toComparableDate(a) > toComparableDate(b)
}

export function dgte(a, b) {
  return toComparableDate(a) >= toComparableDate(b)
}

export function dlte(a, b) {
  return toComparableDate(a) <= toComparableDate(b)
}

export function eventIsToday({ start, end }) {
  const now = new Date()
  return dlte(start, now) && dgte(end, now)
}

export function eventIsTomorrow({ start, end }) {
  const plus24 = +new Date() + ONE_DAY
  return dlte(start, plus24) && dgte(end, plus24)
}

export function eventIsFuture({ start, end }) {
  const plus24 = +new Date() + ONE_DAY
  return dgt(end, plus24)
}
