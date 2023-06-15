import some from "lodash/some"
import React, { useEffect, useRef } from "react"
import { useQuery } from "@apollo/client"

import { GET_CALENDARS } from "../queries"
import { CALENDAR_REFETCH_INTERVAL } from "../const"
import Calendar from "../components/Calendar"
import AddCalendarModal from "../components/AddCalendarModal"

import "./Calendars.css"

function Calendars(props) {
  const { modalState, setModalState } = props
  const refreshInterval = useRef(null)
  const { loading, error, data, refetch } = useQuery(GET_CALENDARS)

  useEffect(() => {
    // refetch every CALENDAR_REFETCH_INTERVAL
    refreshInterval.current = setInterval(() => {
      if (!loading) refetch()
    }, CALENDAR_REFETCH_INTERVAL)

    return () => {
      clearInterval(refreshInterval.current)
    }
  })

  if (loading) return <p>Loading...</p>
  if (
    error &&
    !data &&
    !some(
      ["Authorization", "Unauthorized"].map((m) => error.message.includes(m))
    )
  ) {
    return (
      <div className="error">
        <p>Error :(</p>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    )
  }
  let authNotices = null
  if (error && error.graphQLErrors) {
    authNotices = error.graphQLErrors.map((err) => err.message)
  }

  if (!data || !data.calendars) {
    return (
      <div className="container">
        <h3>Authorization Errors</h3>
        <div className={authNotices ? "error" : "hide"}>{authNotices}</div>
        <div className="container">
          <button onClick={() => setModalState(0)}>Add</button> your first
          calendar
        </div>
        <AddCalendarModal
          modalState={modalState}
          setModalState={setModalState}
        />
      </div>
    )
  }

  const calendars = data.calendars.map((cal) => {
    return <Calendar key={cal.id} calendar={cal} />
  })

  return (
    <div id="calendars">
      {authNotices}
      {calendars}
      <AddCalendarModal modalState={modalState} setModalState={setModalState} />
    </div>
  )
}

export default Calendars
