import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Link } from "react-router-dom"
import get from 'lodash/get'

import Forecast from '../components/Forecast'
import { GET_FORECAST } from '../queries'

import './Weather.css'

function Weather(props) {
  const { loading, error, data, refetch } = useQuery(GET_FORECAST)
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
