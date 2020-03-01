import React, { useState } from 'react'
import moment from 'moment'

import './Event.css'

function nl2br(v) {
  return {
    __html: v ? v.replace(/\n/g, '<br />') : ''
  }
}

function Event(props) {
  const {
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

  return (
    <li className="event">
      <div onClick={() => setExpanded(!expanded)}>
        <div className={`expand${expanded ? '' : ' collapsed'}`}></div>
        <div className="when">{startDateTime.fromNow()} for {durationString}</div>
        <div className="name">{summary}</div>
      </div>
      <div className={`details${expanded ? '' : ' hide'}`}>
          <div className="event-description" dangerouslySetInnerHTML={nl2br(description)} />
          <div className="exact-when">{startDateTime.local().format()}</div>
      </div>
    </li>
  )
}

export default Event
