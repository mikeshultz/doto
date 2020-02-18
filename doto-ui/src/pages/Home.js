import React from 'react'

import './Home.css'

function Home(props) {
  return (
    <div id="home">
      <h1>Home</h1>
      <ul>
        <li><a href="/todo">TODO</a></li>
        <li><a href="/calendar">Calendar</a></li>
      </ul>
    </div>
  )
}

export default Home
