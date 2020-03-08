import React, { useEffect, useRef } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GET_EVENTS } from '../queries'
import { CALENDAR_REFETCH_INTERVAL, ONE_DAY } from '../const'
import Event from '../components/Event'
import AddCalendarModal from '../components/AddCalendarModal'

import './Events.css'

function toStringDate(v) {
  let day
  if (v instanceof Date) {
    day = v
  } else if (typeof v === 'number') {
    day = new Date(v)
  } else {
    day = new Date(v.date ? v.date : v.datetime)
  }
  const y = day.getFullYear()
  const m = String(day.getMonth()).padStart(2, '0')
  const d = String(day.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

function dgt(a, b) {
  return toStringDate(a) > toStringDate(b)
}

function dgte(a, b) {
  return toStringDate(a) >= toStringDate(b)
}

function dlte(a, b) {
  return toStringDate(a) <= toStringDate(b)
}

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

  const now = new Date()
  const plus24 = +new Date() + ONE_DAY

  const isToday = (v) => dlte(v.start, now) && dgte(v.end, now)
  const isTomorrow = (v) => dlte(v.start, plus24) && dgte(v.end, plus24)
  const isFuture = (v) => dgt(v.end, plus24)

  const today = data.events.filter(ev => isToday(ev))
  const tomorrow = data.events.filter(ev => isTomorrow(ev))
  const future = data.events.filter(ev => isFuture(ev))

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
