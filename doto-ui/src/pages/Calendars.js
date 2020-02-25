import React, { useEffect, useRef } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GET_CALENDARS } from '../queries'
import Calendar from '../components/Calendar'
import AddCalendarModal from '../components/AddCalendarModal'

import './Calendars.css'

const CALENDAR_REFETCH_INTERVAL = 900000 // 15m

function Calendars(props) {
  const { modalState, setModalState } = props
  const [refreshInterval, setRefreshInterval] = useRef(null)
  const { loading, error, data, refetch } = useQuery(GET_CALENDARS)

  useEffect(() => {
    // refetch every 30min
    const interval = setInterval(() => {
      if (!loading) refetch()
    }, CALENDAR_REFETCH_INTERVAL)

    setRefreshInterval(interval)

    return () => {
      // Cleanup interval on unmount
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  })

  console.log('######modalState', modalState)

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

  if (!data || !data.calendars) {
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

  console.log('calendars:', data.calendars)

  const calendars = data.calendars.map(cal => {
    return <Calendar key={cal.url} calendar={cal} />
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
