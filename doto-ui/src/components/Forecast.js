import React, { useEffect } from 'react'
import moment from 'moment'
import Chart from 'chart.js'
import 'chartjs-plugin-annotation'

import './Forecast.css'
import arrow from '../static/arrow.png'

// Scaled strangely on canvas
const BASE_POINT_SIZE = 30

function getTempColor(temp, alpha='0.5') {
  if (temp > 80) {
    //return '#FFD46D'
    return `rgba(255,112,35,${alpha})`
  } else if (temp > 60) {
    //return '#FFD46D'
    return `rgba(255,216,35,${alpha})`
  } else if (temp > 40) {
    //return '#9DFF6D'
    return `rgba(126,255,35,${alpha})`
  } else if (temp > 20) {
    //return '#6DFFED'
    return `rgba(35,255,200,${alpha})`
  } else if (temp > 0) {
    //return '#6DC8FF'
    return `rgba(35,200,255,${alpha})`
  }
  //return '#ffffff'
  return `rgba(255,255,255,${alpha})`
}

function Forecast(props) {
  const labels = []
  let maxAlpha = 0.5
  let pointCount = 0
  let maxTemp = 0
  let minTemp = 0
  const icons = []
  const temperatures = []
  const borderColors = []
  const backgroundColors = []
  const pointRotations = []
  const windIcons = []
  const pressures = []

  for (const point of props.points) {
    const time = moment.utc(point.datetime)

    // Chart data
    pointCount += 1
    if (point.main.temp > maxTemp) maxTemp = point.main.temp
    if (point.main.temp < minTemp) minTemp = point.main.temp
    labels.push(time.local().format("ddd, hA"))
    pressures.push(point.main.pressure)
    temperatures.push(point.main.temp)
    borderColors.push(getTempColor(point.main.temp))

    // Wind images
    const windHeight = (point.wind.speed || 0) + BASE_POINT_SIZE
    const windImage = new Image((windHeight / 3.75) + 10, windHeight)
    windImage.src = arrow
    windIcons.push(windImage)
    pointRotations.push(point.wind.deg)

    let pointImage = null
    if (point.weather && point.weather.length > 0) {
      pointImage = new Image(50, 50)
      pointImage.src = `http://openweathermap.org/img/wn/${point.weather[0].icon}@2x.png`
    }
    icons.push(pointImage)

    const pointAlpha = maxAlpha - (pointCount * 0.01)
    backgroundColors.push(getTempColor(point.main.temp, pointAlpha))
  }

  const annotations = []
  const maxColor = getTempColor(maxTemp, '0.8')

  if (maxTemp > 90 && minTemp < 90) {
    annotations.push({
      id: 'hot',
      type: 'line',
      mode: 'horizontal',
      scaleID: 'Temperature',
      value: 90,
      borderColor: 'rgba(249, 107, 68, 0.25)',
      borderWidth: 2,
    })
  }

  if (maxTemp > 32 && minTemp < 32) {
    annotations.push({
      id: 'freezing-line',
      type: 'line',
      mode: 'horizontal',
      scaleID: 'Temperature',
      value: 32,
      borderColor: 'rgba(144, 245, 255, 0.25)',
      borderWidth: 2,
    })
  }

  if (maxTemp > 0 && minTemp < 0) {
    annotations.push({
      id: 'zero-line',
      type: 'line',
      mode: 'horizontal',
      scaleID: 'Temperature',
      value: 0,
      borderColor: 'rgba(68, 185, 249, 0.25)',
      borderWidth: 2,
    })
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
          label: 'Temperature',
          yAxisID: 'Temperature',
          data: temperatures,
          backgroundColor: maxColor,
          pointBorderColor: borderColors,
          pointBackgroundColor: borderColors,
          pointStyle: icons,
          pointRadius: 15,
          borderWidth: 1
        }, {
          label: 'Pressure',
          yAxisID: 'Pressure',
          data: pressures,
          borderColor: 'rgba(255, 255, 255, 0.75)',
          pointRotation: pointRotations,
          pointStyle: windIcons
        }],
      },
      options: {
        annotation: {
          annotations
        },
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
