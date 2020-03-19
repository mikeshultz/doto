import moment from 'moment'
import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/react-hooks'

import { COMPLETE_TASK, DELETE_TASK } from '../queries'

import './Task.css'

function nltobr(v) {
  if (!v) return {__html: ''}
  return {__html: v.replace(/\n/g, '<br>')}
}

function FormattedText(props) {
  const innerHTML = nltobr(props.text)
  return (
    <div>
      <span dangerouslySetInnerHTML={innerHTML} />
    </div>
  )
}

const ONE_DAY = 86400000 // 24 hours
const THREE_DAYS = 259200000 // 72 hours

function Task(props) {
  const givenTask = props.task
  const [task, setTask] = useState({})
  const [completeTask, { data: completeData }] = useMutation(COMPLETE_TASK, {
    variables: {
      taskId: props.task.taskId
    }
  })
  const [deleteTask, { data: deleteData }] = useMutation(DELETE_TASK, {
    variables: {
      taskId: props.task.taskId
    }
  })
  const [expanded, setExpanded] = useState(false)
  const [squashed, setSquashed] = useState(false)

  const deletedTask = deleteData && deleteData.deleteTask ? deleteData.deleteTask.ok : null
  const completedTask = completeData ? completeData.task : null
  console.log('completedTask:', completedTask)
  useEffect(() => {
    setTask({
      ...givenTask,
      //...completedTask
    })
  }, [givenTask]) //, completedTask])

  const { taskId, priority, name, added, deadline, completed, notes } = task
  const now = moment(new Date())
  const dead = deadline ? moment(deadline) : null
  const passed = dead && dead < now
  const soon = dead ? now - dead < ONE_DAY : false
  const near = dead ? now - dead < THREE_DAYS : false

  let priorityClass = 'no-priority'
  if (priority <= 40) priorityClass = 'low'
  if (priority <= 30) priorityClass = 'normal'
  if (priority <= 20) priorityClass = 'high'
  if (priority <= 10) priorityClass = 'extreme'

  const showRibbon = !!(soon || passed || near)
  const ribbonColor = soon || passed ? 'extreme' : near ? 'high' : 'normal'
  const ribbonText = passed ? 'Overdue' : soon ? 'Deadline today' : near ? '3 days left' : ''

  function completeSelf() {
    // Mutation
    completeTask(taskId)

    // Unexpand the element
    setExpanded(false)

    // Transition to a 0 element
    setTimeout(() => {
      setSquashed(true)
    }, 1000)

    // Refetch all tasks
    setTimeout(() => {
      props.refetchTasks()
    }, 3000)
  }

  function deleteSelf() {
    // Mutation
    deleteTask(taskId)

    // Unexpand the element
    setExpanded(false)

    // Transition to a 0 element
    setTimeout(() => {
      setSquashed(true)
    }, 1000)

    // Refetch all tasks
    setTimeout(() => {
      props.refetchTasks()
    }, 3000)
  }

  return (
    <li className={`task ${priorityClass}${deletedTask ? ' deleted' : ''}${completedTask !== null ? ' completed' : ''}${squashed ? ' squashed' : ''}`}>
      <div onClick={() => setExpanded(!expanded)}>
        <div className={`expand padding-1${expanded ? '' : ' collapsed'}`}></div>
        <div className="title padding-1">{name}</div>
        <div className={`ribbon${showRibbon ? '' : ' hide'}`}>
          <div className="ribbon-text">{ribbonText}</div>
          <div className={`inner ${ribbonColor ? ribbonColor : 'hide'}`} />
        </div>
      </div>
      <div className={`details${expanded ? '' : ' hide'}`}>
        <FormattedText text={notes} />
        <div className="columns three">
          <div className="column">
            <span className="label">Added:</span> {added}
          </div>
          <div className={`column${soon ? ' extreme' : ''}`}>
            <span className="label">Deadline:</span> {deadline || '-'}
          </div>
          <div className="column">
            <span className="label">Completed:</span> {completed || '-'}
          </div>
        </div>
        <div className="button-group">
          <button className="edit" onClick={() => props.taskModalState(taskId)}>Edit</button>
          <button className="delete" onClick={deleteSelf}>Delete</button>
          <button className="complete" onClick={completeSelf}>Complete</button>
        </div>
      </div>
    </li>
  )
}

export default Task