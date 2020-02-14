import React, { useState } from 'react'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'

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
  console.log('modalState', modalState)
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Tasks modalState={modalState} taskModalState={setModalState} />
        <AddTaskButton openModal={() => { setModalState(0) }} />
      </div>
    </ApolloProvider>
  )
}

export default App
