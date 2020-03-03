import React, { useEffect, useRef } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GET_EVENTS } from '../queries'
import { CALENDAR_REFETCH_INTERVAL } from '../const'
import Event from '../components/Event'
import AddCalendarModal from '../components/AddCalendarModal'

//import './Events.css'

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
  if (error && !data && !error.message.includes('Unauthorized')) {
    console.log('err', error)
    console.log('typeof err', typeof error)
    console.log('err.message', error.message)
    return <p>
      Error :(
      {error.message}
      <button onClick={() => window.location.reload()}>Refresh</button>
    </p>
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

  const events = data.events.map(ev => {
    console.log('rendering events: ', ev.id)
    return <Event key={ev.id} event={ev} />
  })

  return (
    <div id="events">
      {authNotices}
      <ul className="events-container">
        {events}
      </ul>
      <AddCalendarModal modalState={modalState} setModalState={setModalState} />
    </div>
  )
}

export default Events
