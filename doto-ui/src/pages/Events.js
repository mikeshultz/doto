import React, { useEffect, useRef } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GET_EVENTS } from '../queries'
import { CALENDAR_REFETCH_INTERVAL } from '../const'
import { authRedir } from '../utils'
import { eventIsToday, eventIsTomorrow, eventIsFuture } from '../utils/date'
import Event from '../components/Event'
import AddCalendarModal from '../components/AddCalendarModal'

import './Events.css'

function Events(props) {
  const { modalState, setModalState } = props
  const refreshInterval = useRef(null)
  const { loading, error, data, refetch } = useQuery(GET_EVENTS)

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
  if (error && !data) {
    const redir = authRedir(error)
    if (redir) window.location = redir

    return <div className="error">
      <p>Error :(</p>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  }

  let authNotices = null
  if (error && error.graphQLErrors) {
    authNotices = error.graphQLErrors.map(err => err.message)
  }

  if (!data || !data.events) {
    return <div className="container">
      <div className={authNotices ? 'error' : 'hide'}>
        {authNotices}
      </div>
      <div className="container">
        <button onClick={() => setModalState(0)}>Add</button> your first calendar
      </div>
      <AddCalendarModal modalState={modalState} setModalState={setModalState} />
    </div>
  }

  const today = data.events.filter(ev => eventIsToday(ev))
  const tomorrow = data.events.filter(ev => eventIsTomorrow(ev))
  const future = data.events.filter(ev => eventIsFuture(ev))

  const todaysEvents = today.map(ev => {
    console.log('today ev: ', ev.id)
    return <Event key={ev.id} event={ev} />
  })

  const tomorrowsEvents = tomorrow.map(ev => {
    console.log('tomorrow ev: ', ev.id)
    return <Event key={ev.id} event={ev} />
  })

  const laterEvents = future.map(ev => {
    console.log('not today ev: ', ev.id)
    return <Event key={ev.id} event={ev} />
  })

  return (
    <div id="events">
      {authNotices}
      <ul className="events-container today">
        {todaysEvents}
      </ul>
      <ul className="events-container tomorrow">
        {tomorrowsEvents}
      </ul>
      <ul className="events-container future">
        {laterEvents}
      </ul>
      <AddCalendarModal modalState={modalState} setModalState={setModalState} />
    </div>
  )
}

export default Events
