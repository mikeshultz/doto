import React from 'react'
import moment from 'moment'

import './Forecast.css'

function ColoredTemp(props) {
  console.log('temp: ', props.temp)
  let color = '#FF6D6D'
  if (props.temp > 80) {
    color = '#FFD46D'
  } else if (props.temp > 60) {
    color = '#FFD46D'
  } else if (props.temp > 40) {
    color = '#9DFF6D'
  } else if (props.temp > 20) {
    color = '#6DFFED'
  } else if (props.temp > 0) {
    color = '#6DC8FF'
  } else {
    color = '#ffffff'
  }

  const style = {
    color
  }

  return <span style={style}>{props.temp}</span>
}

function Forecast(props) {
  const points = props.points.map(point => {
    const time = moment(point.datetime)
    return <li>
      {time.fromNow()} | <ColoredTemp temp={point.main.temp} />
    </li>
  })

  return (
    <ul id="forecast">
      {points}
    </ul>
  )
}

export default Forecast
