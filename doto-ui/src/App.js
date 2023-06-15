import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client"
import React, { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Calendars from "./pages/Calendars"
import Events from "./pages/Events"
import Tasks from "./pages/Tasks"
import Weather from "./pages/Weather"
import Devices from "./pages/Devices"
import AddButton from "./components/AddButton"

import "./App.css"

console.log(
  "Using GraphQL endpoint: ",
  process.env.REACT_APP_GRAPHQL || "/graphql"
)
const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL || "/graphql",
  cache: new InMemoryCache(),
})

function App() {
  // -1 don't display, ==0 empty modal, > 0 display that ID
  const [taskModalState, setTaskModalState] = useState(-1)
  const [calendarModalState, setCalendarModalState] = useState(-1)
  return (
    <ApolloProvider client={client}>
      <Router forceRefresh={false}>
        <div className="App">
          <Routes>
            <Route
              path="/todo"
              element={
                <>
                  <Tasks
                    modalState={taskModalState}
                    taskModalState={setTaskModalState}
                  />
                  <AddButton
                    openModal={() => {
                      setTaskModalState(0)
                    }}
                  />
                </>
              }
            />
            <Route
              path="/calendar"
              element={
                <>
                  <Calendars
                    modalState={calendarModalState}
                    setModalState={setCalendarModalState}
                  />
                  <AddButton
                    openModal={() => {
                      setCalendarModalState(0)
                    }}
                  />
                </>
              }
            />
            <Route
              path="/events"
              element={
                <>
                  <Events
                    modalState={calendarModalState}
                    setModalState={setCalendarModalState}
                  />
                  <AddButton
                    openModal={() => {
                      setCalendarModalState(0)
                    }}
                  />
                </>
              }
            />
            <Route path="/weather" element={<Weather />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  )
}

export default App
