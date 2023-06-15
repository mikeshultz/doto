import React, { useEffect, useRef } from "react"
import { useQuery } from "@apollo/client"

import Device from "../components/Device"
import { GET_DEVICES } from "../queries"

import "./Devices.css"

const DEVICE_REFETCH_INTERVAL = 30000 // 30s

function Devices(props) {
  const refreshInterval = useRef(null)
  const { loading, error, data, refetch } = useQuery(GET_DEVICES)

  useEffect(() => {
    // refetch every interval
    refreshInterval.current = setInterval(() => {
      if (!loading) {
        console.debug("refreshing devices...")
        refetch()
      }
    }, DEVICE_REFETCH_INTERVAL)

    return () => {
      clearInterval(refreshInterval.current)
    }
  })

  if (error) {
    console.error(error)
    return null
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const devices = data.devices
    .sort((a, b) => {
      const A = a && a.name ? a.name.toUpperCase() : ""
      const B = b && b.name ? b.name.toUpperCase() : ""
      if (A < B) return -1
      if (A > B) return 1
      return 0
    })
    .map((d) => {
      return <Device key={d.mac} device={d} refetchDevices={refetch} />
    })

  return (
    <div>
      <ul className="devices">{devices}</ul>
    </div>
  )
}

export default Devices
