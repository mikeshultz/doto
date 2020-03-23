import React, { useState } from 'react'
import moment from 'moment'

import './Event.css'

const ONE_DAY = 86400000 // 24 hours

function nl2br(v) {
  return {
    __html: v ? v.replace(/\n/g, '<br />') : ''
  }
}

function sameDay(a, b) {
  console.log(`sameDay(${a}, ${b})`)
  if (!a || !b) return false
  if (a.year() !== b.year()) return false
  if (a.month() !== b.month()) return false
  if (a.day() !== b.day()) return false
  return true
}

function isToday(v) {
  const now = moment()
  return sameDay(now, v)
}

function eventIsToday({ start, end }) {
  if (!start || !end) return false
  const now = moment()
  return (
    isToday(start)
    || isToday(end)
    || now.isBetween(start, end)
  )
}

function eventIsTomorrow({ start, end }) {
  if (!start || !end) return false
  const plus24 = moment(moment() + ONE_DAY)
  return (
    sameDay(plus24, start)
    || sameDay(plus24, end)
    || plus24.isBetween(start, end)
  )
}

function Event(props) {
  /**
   Available event props
    id,
    status,
    created,
    updated,
    summary,
    description,
    colorId,
    creator,
    organizer,
    start,
    end,
    originalStartTime,
    recurringEventId,
    reminders,
  */
  const {
    summary,
    description,
    start,
    end,
  } = props.event
  const [expanded, setExpanded] = useState(false)

  const startDateTime = moment(start.datetime || start.date)
  const endDateTime = moment(end.datetime || end.date)
  const duration = moment.duration(endDateTime - startDateTime)
  let durationString = `${duration.asMinutes()} minutes`
  if (duration.asSeconds() > 3600) {
    durationString = `${duration.asHours()} hours`
  } else if (duration.asSeconds() > 86400) {
    durationString = `${duration.asDays()} days`
  }

  const today = eventIsToday({ start: startDateTime, end: endDateTime })
  const tomorrow = eventIsTomorrow({ start: startDateTime, end: endDateTime })

  const showRibbon = !!today || !!tomorrow
  const ribbonText = today ? 'Today' : tomorrow ? 'Tomorrow' : ''
  const ribbonColor = today ? 'extreme' : tomorrow ? 'high' : ''

  return (
    <li className="event">
      <div onClick={() => setExpanded(!expanded)}>
        <div className={`expand${expanded ? '' : ' collapsed'}`}></div>
        <div className="when">{startDateTime.fromNow()} for {durationString}</div>
        <div className="name">{summary}</div>
        <div className={`ribbon${showRibbon ? '' : ' hide'}`}>
          <div className="ribbon-text">{ribbonText}</div>
          <div className={`inner ${ribbonColor ? ribbonColor : 'hide'}`} />
        </div>
      </div>
      <div className={`details${expanded ? '' : ' hide'}`}>
          <div className="event-description" dangerouslySetInnerHTML={nl2br(description)} />
          <div className="exact-when">{startDateTime.local().format()}</div>
      </div>
    </li>
  )
}

export default Event
