import React from 'react'
import { Link } from "react-router-dom"

import './Home.css'

function Home(props) {
  return (
    <div id="home">
      <h1>Home</h1>
      <ul>
        <li><Link to="/todo">TODO</Link></li>
        <li><Link to="/calendar">Calendar</Link></li>
      </ul>
    </div>
  )
}

export default Home
