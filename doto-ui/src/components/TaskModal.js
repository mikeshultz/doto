import moment from 'moment'
import React, { useState, useEffect }  from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import DateTime from 'react-datetime'

import { TASK, CREATE_TASK, UPDATE_TASK } from '../queries'

import './TaskModal.css'

const DEFAULT_TASK = {
  taskId: null,
  priority: '',
  name: '',
  notes: '',
  deadline: ''
}
const PRIORITY_OPTIONS = [
  { label: 'Extreme', value: 10 },
  { label: 'High', value: 20 },
  { label: 'Normal', value: 30 },
  { label: 'Low', value: 40 }
]

function Field(props) {
  return (
    <div className="field">
      <label htmlFor={props.name}>{props.label || props.name}</label>
      <input type={props.type || 'text'} name={props.name} id={props.id} placeholder={props.placeohlder} value={props.value} onChange={props.onChange} />
    </div>
  )
}

function TextField(props) {
  return (
    <div className="field">
      <label htmlFor={props.name}>{props.label || props.name}</label>
      <textarea name={props.name} id={props.id} onChange={props.onChange} defaultValue={props.value || props.placeohlder} />
    </div>
  )
}

function DateField(props) {
  return (
    <div className="field">
      <label htmlFor={props.name}>{props.label || props.name}</label>
      <DateTime value={props.value} onChange={props.onChange} />
    </div>
  )
}

function SelectField(props) {
  const children = props.options.map(opt => {
    return (
      <option value={opt.value}>
        {opt.label}
      </option>
    )
  })
  return (
    <div className="field">
      <label htmlFor={props.name}>{props.label || props.name}</label>
      <select className="field" name={props.name} value={props.value || 30} onChange={props.onChange}>
        {children}
      </select>
    </div>
  )
}

function TaskModal(props) {
  const [saved, setSaved] = useState(false)
  const [task, setTask] = useState(DEFAULT_TASK)
  const { loading, error, data, refetch } = useQuery(TASK, {
    variables: {
      taskId: props.modalState
    },
    skip: props.modalState < 1
  })
  const [addTask, { data: addedData }] = useMutation(CREATE_TASK)
  const [saveTask, { data: updatedData }] = useMutation(UPDATE_TASK)

  useEffect(() => {
    if (saved) {
      clear()
      props.taskModalState(-1)
      setSaved(false)
    }
    if (task.taskId !== null) return
    if (data && data.task) {
      setTask(data.task)
    }
    if (addedData && addedData.task) {
      setTask(addedData)
    }
    if (updatedData && updatedData.task) {
      setTask({
        ...task,
        ...updatedData.task
      })
    }
  }, [props, data, addedData, updatedData, task, saved])

  if (loading) return null
  if (error) {
    console.error(error)
    return null
  }
  if (props.modalState < 0) return null

  function save(e) {
    console.log('****save()', e)
    e.preventDefault()
    if (task.taskId === null) {
      addTask({
        variables: {
          taskId: task.taskId,
          priority: task.priority || 30,
          name: task.name,
          notes: task.notes,
          deadline: task.deadline || null
        }
      })
    } else {
      saveTask({
        variables: {
          taskId: task.taskId,
          priority: task.priority,
          name: task.name,
          notes: task.notes,
          deadline: task.deadline
        }
      })
    }
    props.tasksRefetch()
    refetch()
    setSaved(true)
  }

  function clear() {
    setTask(DEFAULT_TASK)
  }

  function changedName(v) {
    setTask({ ...task, name: v.target.value })
  }

  function changedDeadline(mom) {
    // TODO: Allow typing in?
    if (!(mom instanceof moment)) {
      console.warn('This probably won\'t work for typing in dates')
      mom = moment(mom)
    }
    setTask({ ...task, deadline: mom.format() })
  }

  function changedPriority(v) {
    console.log('changedPriority: ', v.target.value)
    setTask({ ...task, priority: v.target.value })
  }

  function changedNotes(v) {
    setTask({ ...task, notes: v.target.value })
  }

  const { name, notes, deadline } = task
  const deadVal = deadline // || new Date()
  return (
    <div className={`modal`}>
      <form onSubmit={save}>
        <Field id="task-name" label="Title" name="name" value={name} onChange={changedName} />
        <DateField label="Deadline" value={deadVal} onChange={changedDeadline} />

        <SelectField
          label="Priority"
          name="priority"
          options={PRIORITY_OPTIONS}
          value={task.priority}
          onChange={changedPriority}
          />

        <TextField id="task-notes" label="Notes" name="notes" value={notes} onChange={changedNotes} />

        <div className="button-group">
          <button type="submit" className="save">Save</button>
          <button className="close" onClick={() => { clear(); props.taskModalState(-1) }}>Close</button>
        </div>
      </form>
    </div>
  )
}

export default TaskModal
