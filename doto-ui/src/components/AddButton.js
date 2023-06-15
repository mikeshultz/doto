import React from "react"

import "./AddButton.css"

function AddButton(props) {
  return (
    <div className="AddButton" onClick={props.openModal}>
      &#43;
    </div>
  )
}

export default AddButton
