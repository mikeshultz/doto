import React, { useEffect, useRef } from "react"
import { useQuery } from "@apollo/client"
import get from "lodash/get"

import Forecast from "../components/Forecast"
import { GET_FORECAST } from "../queries"

import "./Weather.css"

const WEATHER_REFETCH_INTERVAL = 1800000 // 30m

function Weather(props) {
  const refreshInterval = useRef(null)
  const { loading, error, data, refetch } = useQuery(GET_FORECAST)

  useEffect(() => {
    // refetch every 30min
    refreshInterval.current = setInterval(() => {
      if (!loading) refetch()
    }, WEATHER_REFETCH_INTERVAL)

    return () => {
      clearInterval(refreshInterval.current)
    }
  })

  if (error) {
    console.error(error)
    return null
  }

  return (
    <div id="home">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Forecast points={get(data, "forecast.points")} />
      )}
    </div>
  )
}

export default Weather
