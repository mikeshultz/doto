import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'

import Home from './pages/Home'
import Calendars from './pages/Calendars'
import Tasks from './pages/Tasks'
import Weather from './pages/Weather'
import AddButton from './components/AddButton'

import './App.css'

console.log('Using GraphQL endpoint: ', process.env.REACT_APP_GRAPHQL || '/graphql')
const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL || '/graphql',
})

function App() {
  // -1 don't display, ==0 empty modal, > 0 display that ID
  const [taskModalState, setTaskModalState] = useState(-1)
  const [calendarModalState, setCalendarModalState] = useState(-1)
  return (
    <ApolloProvider client={client}>
      <Router forceRefresh={false}>
        <div className="App">
          <Switch>
            <Route path="/todo">
              <Tasks modalState={taskModalState} taskModalState={setTaskModalState} />
              <AddButton openModal={() => { setTaskModalState(0) }} />
            </Route>
            <Route path="/calendar">
              <Calendars modalState={calendarModalState} setModalState={setCalendarModalState} />
              <AddButton openModal={() => { setCalendarModalState(0) }} />
            </Route>
            <Route path="/weather">
              <Weather />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </ApolloProvider>
  )
}

export default App
