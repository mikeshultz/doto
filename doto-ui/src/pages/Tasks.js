import React, { useEffect, useRef } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { TASKS } from '../queries'
import Task from '../components/Task'
import TaskModal from '../components/TaskModal'

import './Tasks.css'

const TASK_REFETCH_INTERVAL = 1800000 // 30m

function Tasks(props) {
  const [refreshInterval, setRefreshInterval] = useRef(null)
  const { loading, error, data, refetch } = useQuery(TASKS)

  useEffect(() => {
    // refetch every 30min
    const interval = setInterval(() => {
      if (!loading) refetch()
    }, TASK_REFETCH_INTERVAL)

    setRefreshInterval(interval)

    return () => {
      // Cleanup interval on unmount
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  })

  if (loading) return <p>Loading...</p>
  if (error) {
    return <p>
      Error :(
      {error.message}
      <button onClick={window.location.reload()}>Refresh</button>
    </p>
  }

  if (!data || !data.tasks) {
    // TODO
    return <p><button onClick={() => props.taskModalState(0)}>Create</button> your first task</p>
  }

  // Don't show completed tasks
  const tasks = data.tasks.filter(t => !t.completed).map(t => {
    return <Task key={t.taskId} task={t} taskModalState={props.taskModalState} refetchTasks={refetch} />
  })

  return (
    <div>
      <ul className="tasks">
          {tasks}
      </ul>
      <TaskModal modalState={props.modalState} taskModalState={props.taskModalState} tasksRefetch={refetch} />
    </div>
  )
}

export default Tasks
