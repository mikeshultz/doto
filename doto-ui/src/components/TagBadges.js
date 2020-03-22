import React, { useState, useEffect } from 'react'

import { isLight, rgbHash } from '../utils'

import './TagBadges.css'

const DEFAULT_DARK = '#000000'
const DEFAULT_LIGHT = '#ffffff'

function Badge(props) {
  const { value } = props
  const [bgColor, setBgColor] = useState('#cfcfcf')
  const [fgColor, setFgColor] = useState('#000000')

  useEffect(() => {
    rgbHash(value).then(col => {
      setBgColor(col)
      // Set the fg color to an opposite brightness for clarity
      if (isLight(col) && isLight(fgColor)) {
        setFgColor(DEFAULT_DARK)
      } else if (!isLight(col) && !isLight(fgColor)) {
        setFgColor(DEFAULT_LIGHT)
      }
    })
  }, [])

  return (
    <div className="badge" style={{
      background: bgColor,
      color: fgColor
    }}>{value}</div>
  )
}

function TagBadges(props) {
  const { tags } = props
  if (!tags) return null
  const badges = tags.split(',').map(tag => (<Badge key={tag} value={tag} />))
  return (
    <div className="badges">
      {badges}
    </div>
  )
}

export default TagBadges
