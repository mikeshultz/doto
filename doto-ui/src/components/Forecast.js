import React, { useEffect } from 'react'
import moment from 'moment'
import Chart from 'chart.js'

import './Forecast.css'

function getTempColor(temp, alpha='0.5') {
  if (temp > 80) {
    //return '#FFD46D'
    return `rgba(255,212,109,${alpha})`
  } else if (temp > 60) {
    //return '#FFD46D'
    return `rgba(255,212,109,${alpha})`
  } else if (temp > 40) {
    //return '#9DFF6D'
    return `rgba(157,255,109,${alpha})`
  } else if (temp > 20) {
    //return '#6DFFED'
    return `rgba(109,255,237,${alpha})`
  } else if (temp > 0) {
    //return '#6DC8FF'
    return `rgba(109,200,255,${alpha})`
  }
  //return '#ffffff'
  return `rgba(255,255,255,${alpha})`
}

function Forecast(props) {
  const labels = []
  let maxAlpha = 0.5
  let pointCount = 0
  let pointSum = 0
  let avgTemp = 0
  let avgColor = getTempColor(avgTemp)
  const dataPoints = []
  const borderColors = []
  const backgroundColors = []

  for (const point of props.points) {
    const time = moment.utc(point.datetime)

    // Chart data
    pointCount += 1
    pointSum += point.main.temp
    labels.push(time.local().format("ddd, hA"))
    dataPoints.push(point.main.temp)
    borderColors.push(getTempColor(point.main.temp))
    const pointAlpha = maxAlpha - (pointCount * 0.01)
    backgroundColors.push(getTempColor(point.main.temp, pointAlpha))
  }

  if (pointCount > 0) {
    avgTemp = pointSum / pointCount
    avgColor = getTempColor(avgTemp, '0.2')
  }

  useEffect(() => {
    const el = document.getElementById('forecastchart')
    const ctx = el.getContext('2d')
    // eslint-disable-next-line no-unused-vars
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: avgColor,
          borderColor: borderColors,
          borderWidth: 1
        }],
      },
      options: {
        legend: {
          display: false
        }
      }
    })
  })

  return (
    <canvas id="forecastchart"></canvas>
  )
}

export default Forecast
