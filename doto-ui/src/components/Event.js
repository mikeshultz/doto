import React, { useState } from 'react'
import moment from 'moment'

import './Event.css'

function nl2br(v) {
  return {
    __html: v.replace(/\n/g, '<br />')
  }
}

function Event(props) {
  const { name, description, begin, duration: rawDuration } = props.event
  const [expanded, setExpanded] = useState(false)

  const duration = moment.duration(rawDuration)
  let durationString = `${duration.asMinutes()} minutes`
  if (duration.asSeconds() > 3600) {
    durationString = `${duration.asHours()} hours`
  } else if (duration.asSeconds() > 86400) {
    durationString = `${duration.asDays()} days`
  }

  // TODO: TZ?
  const when = moment.utc(begin)

  return (
    <li className="event">
      <div onClick={() => setExpanded(!expanded)}>
        <div className={`expand${expanded ? '' : ' collapsed'}`}></div>
        <div className="when">{when.fromNow()} for {durationString}</div>
        <div className="name">{name}</div>
      </div>
      <div className={`details${expanded ? '' : ' hide'}`}>
          <div className="event-description" dangerouslySetInnerHTML={nl2br(description)} />
          <div className="exact-when">{when.local().format()}</div>
      </div>
    </li>
  )
}

export default Event
