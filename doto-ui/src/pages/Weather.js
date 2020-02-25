import React, { useEffect, useRef } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Link } from "react-router-dom"
import get from 'lodash/get'

import Forecast from '../components/Forecast'
import { GET_FORECAST } from '../queries'

import './Weather.css'

const WEATHER_REFETCH_INTERVAL = 1800000 // 30m

function Weather(props) {
  const [refreshInterval, setRefreshInterval] = useRef(null)
  const { loading, error, data, refetch } = useQuery(GET_FORECAST)

  useEffect(() => {
    // refetch every 30min
    const interval = setInterval(() => {
      if (!loading) refetch()
    }, WEATHER_REFETCH_INTERVAL)

    setRefreshInterval(interval)

    return () => {
      // Cleanup interval on unmount
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  })

  return (
    <div id="home">
      <h1>Weather</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Forecast points={get(data, 'forecast.points')}/>
      )}
    </div>
  )
}

export default Weather
