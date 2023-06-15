import React, { useState, useEffect } from "react"

import { isLight, rgbHash } from "../utils"

import "./Badge.css"

const DEFAULT_DARK = "#000000"
const DEFAULT_LIGHT = "#ffffff"

function Badge(props) {
  const { value, bgoverride, onClick } = props
  const [bgColor, setBgColor] = useState(bgoverride || "#cfcfcf")
  const [fgColor, setFgColor] = useState("#000000")

  useEffect(() => {
    rgbHash(value).then((col) => {
      if (bgoverride) col = bgoverride
      setBgColor(col)
      // Set the fg color to an opposite brightness for clarity
      if (isLight(col) && isLight(fgColor)) {
        setFgColor(DEFAULT_DARK)
      } else if (!isLight(col) && !isLight(fgColor)) {
        setFgColor(DEFAULT_LIGHT)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="badge"
      style={{
        background: bgColor,
        color: fgColor,
        cursor: onClick ? "pointer" : "inherit",
      }}
      onClick={onClick}
    >
      {value}
    </div>
  )
}

export default Badge
