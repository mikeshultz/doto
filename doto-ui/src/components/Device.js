import React from 'react'
import { useMutation } from '@apollo/react-hooks'

import { DEVICE_ON, DEVICE_OFF } from '../queries'

import Error from './Error'

import './Device.css'

function DeviceStateToggle(props) {
  const { state, toggle } = props

  return (
    <div className={`device-toggle ${state === 'ON' ? 'on' : 'off'}`} onClick={toggle}></div>
  )
}

function Device(props) {
  const { device, refetchDevices } = props
  const { mac, name, state } = device
  const [deviceOn, { data: deviceOnData, error: deviceOnError }] = useMutation(DEVICE_ON, {
    variables: {
      mac
    }
  })
  const [deviceOff, { data: deviceOffData, error: deviceOffError }] = useMutation(DEVICE_OFF, {
    variables: {
      mac
    }
  })

  if (deviceOnError || deviceOffError) {
    console.errror(`Error: ${deviceOnError || deviceOffError}`)
    return (
      <Error error={deviceOnError || deviceOffError} />
    )
  }

  if (deviceOffData) {
    if (!deviceOffData.deviceOff || !deviceOffData.deviceOff.ok) {
      console.error(`Failed to turn off device ${mac}`)
    }
    refetchDevices()
  }

  if (deviceOnData) {
    if (!deviceOnData.deviceOn || !deviceOnData.deviceOn.ok) {
      console.error(`Failed to turn on device ${mac}`)
    }
    refetchDevices()
  }

  function toggleDevice() {
    console.log('toggleDevice state:', state)
    if (state === 'ON') {
      return deviceOff()
    } else {
      return deviceOn()
    }
  }

  return (
    <li className="device">
      <div onClick={toggleDevice}>
        <div className="title padding-1">
          {name}
          <DeviceStateToggle state={state} toggle={toggleDevice} />
        </div>
      </div>
    </li>
  )
}

export default Device
