import React, { useEffect, useRef, useState } from "react"
import moment from "moment"

import { CALENDAR_DATE_TICK } from "../const"
import { eventIsToday, eventIsTomorrow } from "../utils/date"

import "./Event.css"

function nl2br(v) {
  return {
    __html: v ? v.replace(/\n/g, "<br />") : "",
  }
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
  const { summary, description, start, end } = props.event
  const [expanded, setExpanded] = useState(false)
  const [fromNow, setFromNow] = useState(false)
  const tickInterval = useRef(null)

  const startDateTime = moment(start.datetime || start.date)
  const endDateTime = moment(end.datetime || end.date)
  const duration = moment.duration(endDateTime - startDateTime)

  useEffect(() => {
    // Update the "front now" string
    const tick = () => {
      setFromNow(startDateTime.fromNow())
    }

    // First render
    tick()

    // Tick interval
    tickInterval.current = setInterval(() => {
      tick()
    }, CALENDAR_DATE_TICK)

    return () => {
      clearInterval(tickInterval.current)
    }
  }, [startDateTime])

  let durationString = `${duration.asMinutes()} minutes`
  if (duration.asSeconds() > 3600) {
    durationString = `${duration.asHours()} hours`
  } else if (duration.asSeconds() > 86400) {
    durationString = `${duration.asDays()} days`
  }

  const today = eventIsToday({ start: startDateTime, end: endDateTime })
  const tomorrow = eventIsTomorrow({ start: startDateTime, end: endDateTime })

  const showRibbon = !!today || !!tomorrow
  const ribbonText = today ? "Today" : tomorrow ? "Tomorrow" : ""
  const ribbonColor = today ? "extreme" : tomorrow ? "high" : ""

  return (
    <li className="event">
      <div onClick={() => setExpanded(!expanded)}>
        <div className={`expand${expanded ? "" : " collapsed"}`}></div>
        <div className="when">
          {fromNow} for {durationString}
        </div>
        <div className="name">{summary}</div>
        <div className={`ribbon${showRibbon ? "" : " hide"}`}>
          <div className="ribbon-text">{ribbonText}</div>
          <div className={`inner ${ribbonColor ? ribbonColor : "hide"}`} />
        </div>
      </div>
      <div className={`details${expanded ? "" : " hide"}`}>
        <div
          className="event-description"
          dangerouslySetInnerHTML={nl2br(description)}
        />
        <div className="exact-when">{startDateTime.local().format()}</div>
      </div>
    </li>
  )
}

export default Event
