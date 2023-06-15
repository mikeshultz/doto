import React, { useEffect, useRef, useState } from "react"
import { useQuery } from "@apollo/client"

import { TASKS } from "../queries"
import Task from "../components/Task"
import TaskModal from "../components/TaskModal"
import TagNav from "../components/TagNav"

import "./Tasks.css"

const TASK_REFETCH_INTERVAL = 1800000 // 30m

function Tasks(props) {
  const refreshInterval = useRef(null)
  const [filter, setFilter] = useState(null)

  const variables = {}
  if (filter) {
    variables.taskFilter = filter
  }

  const { loading, error, data, refetch } = useQuery(TASKS, { variables })

  useEffect(() => {
    // refetch every 30min
    refreshInterval.current = setInterval(() => {
      if (!loading) refetch()
    }, TASK_REFETCH_INTERVAL)

    return () => {
      clearInterval(refreshInterval.current)
    }
  })

  if (loading) return <p>Loading...</p>
  if (error) {
    return (
      <p>
        Error :(
        {error.message}
        <button onClick={window.location.reload()}>Refresh</button>
      </p>
    )
  }

  if (!data || !data.tasks) {
    // TODO
    return (
      <p>
        <button onClick={() => props.taskModalState(0)}>Create</button> your
        first task
      </p>
    )
  }

  function addFilter(f) {
    setFilter(f)
  }

  function clearFilter() {
    setFilter(null)
  }

  // Don't show completed tasks
  const tasks = data.tasks
    .filter((t) => !t.completed)
    .map((t) => {
      return (
        <Task
          key={t.taskId}
          task={t}
          taskModalState={props.taskModalState}
          refetchTasks={refetch}
        />
      )
    })

  return (
    <div>
      <TagNav
        currentFilter={filter}
        addFilter={addFilter}
        clearFilter={clearFilter}
      />
      <ul className="tasks">{tasks}</ul>
      <TaskModal
        modalState={props.modalState}
        taskModalState={props.taskModalState}
        tasksRefetch={refetch}
      />
    </div>
  )
}

export default Tasks
