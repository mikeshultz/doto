import React from 'react'

import './AddTaskButton.css'

function AddTaskButton(props) {
  return (
    <div className="AddTaskButton" onClick={props.openModal}>
        &#43;
    </div>
  )
}

export default AddTaskButton
