import React, { useEffect } from 'react'
import moment from 'moment'
import Chart from 'chart.js'

import './Forecast.css'
import arrow from '../static/arrow.png'

const BASE_POINT_SIZE = 5

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
  const icons = []
  const temperatures = []
  const borderColors = []
  const backgroundColors = []
  const pointRotations = []
  const pointSizes = []
  const pressures = []

  for (const point of props.points) {
    const time = moment.utc(point.datetime)

    // Chart data
    pointCount += 1
    pointSum += point.main.temp
    labels.push(time.local().format("ddd, hA"))
    pressures.push(point.main.pressure)
    temperatures.push(point.main.temp)
    pointRotations.push(point.wind.deg)
    pointSizes.push(point.wind.speed + BASE_POINT_SIZE)
    borderColors.push(getTempColor(point.main.temp))

    let pointImage = null
    if (point.weather && point.weather.length > 0) {
      pointImage = new Image(50, 50)
      pointImage.src = `http://openweathermap.org/img/wn/${point.weather[0].icon}@2x.png`
    }
    icons.push(pointImage)

    //console.log('pressure point:', point.main.pressure)
    //borderColors[0] = 'rgba(255,255,255,1)'
    const pointAlpha = maxAlpha - (pointCount * 0.01)
    backgroundColors.push(getTempColor(point.main.temp, pointAlpha))
  }

  if (pointCount > 0) {
    avgTemp = pointSum / pointCount
    avgColor = getTempColor(avgTemp, '0.3')
  }

  useEffect(() => {
    const el = document.getElementById('forecastchart')
    const ctx = el.getContext('2d')
    const pointRadius = 10
    const arrowImage = new Image(4, 15)
    arrowImage.src = arrow
    // eslint-disable-next-line no-unused-vars
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Temperature',
          yAxisID: 'Temperature',
          data: temperatures,
          backgroundColor: avgColor,
          pointBorderColor: borderColors,
          pointBackgroundColor: borderColors,
          pointStyle: icons,
          pointRadius: 15,
          borderWidth: 1
        }, {
          label: 'Pressure',
          yAxisID: 'Pressure',
          data: pressures,
          borderColor: 'rgba(255, 255, 255, 0.25)',
          pointRadius: pointSizes,
          pointRotation: pointRotations,
          pointHoverRadius: pointSizes,
          pointStyle: arrowImage
        }],
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          yAxes: [
            {
              id: 'Temperature',
              type: 'linear',
              position: 'left',
              scalePositionLeft: true,
              min: 0,
              max: 100
            },
            {
              id: 'Pressure',
              type: 'linear',
              position: 'right',
              scalePositionLeft: false,
              min: 500,
              max: 1090
            }
          ]
        }
      }
    })
  })

  return (
    <canvas id="forecastchart"></canvas>
  )
}

export default Forecast
