import React from 'react'

import Event from './Event'

import './Calendar.css'

function Calendar(props) {
  const { name, events } = props.calendar
  const evs = events.map(ev => {
    return <Event key={ev.url} event={ev} />
  })
  if (evs.length < 1) return null
  return (
    <div className="calendar">
        Calendar: {name}
        <ul className="events">
            {evs}
        </ul>
    </div>
  )
}

export default Calendar
