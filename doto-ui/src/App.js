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
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import AddTaskButton from './components/AddTaskButton'

import './App.css'

console.log('Using GraphQL endpoint: ', process.env.REACT_APP_GRAPHQL || '/graphql')
const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL || '/graphql',
})

function App() {
  // -1 don't display, ==0 empty modal, > 0 display that ID
  const [modalState, setModalState] = useState(-1)
  return (
    <ApolloProvider client={client}>
      <Router forceRefresh={false}>
        <div className="App">
          <Switch>
            <Route path="/todo">
              <Tasks modalState={modalState} taskModalState={setModalState} />
              <AddTaskButton openModal={() => { setModalState(0) }} />
            </Route>
            <Route path="/calendar">
              <Calendar />
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
