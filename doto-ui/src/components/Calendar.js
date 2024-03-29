import React, { useEffect, useRef } from "react"
import { useQuery } from "@apollo/client"

import { GET_EVENTS } from "../queries"
import { CALENDAR_REFETCH_INTERVAL } from "../const"
import { authRedir } from "../utils"
import Error from "./Error"
import Event from "./Event"

import "./Calendar.css"

export default function Calendar(props) {
  const { id, summary } = props.calendar
  const refreshInterval = useRef(null)
  const { loading, error, data, refetch } = useQuery(GET_EVENTS, {
    variables: {
      calendarId: id,
    },
  })

  // TODO: Is this redundant with Calnedars page?
  useEffect(() => {
    // refetch every CALENDAR_REFETCH_INTERVAL
    refreshInterval.current = setInterval(() => {
      if (!loading) refetch()
    }, CALENDAR_REFETCH_INTERVAL)

    return () => {
      clearInterval(refreshInterval.current)
    }
  })

  if (loading) return null
  if (error) {
    const redir = authRedir(error)
    if (redir) window.location = redir
    return <Error error={error} />
  }

  const evs =
    data && data.events
      ? data.events.map((ev) => {
          return <Event key={ev.id} event={ev} />
        })
      : []

  if (evs.length < 1) return null

  return (
    <div className="calendar">
      Calendar: {summary}
      <ul className="events">{evs}</ul>
    </div>
  )
}
