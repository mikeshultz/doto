import React from 'react'

import './Error.css'

function Error(props) {
  const { error } = props
  
  return (
    <div className="error">
        {error.message}
    </div>
  )
}

export default Error
