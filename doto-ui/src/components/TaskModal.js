import moment from 'moment'
import React, { useState, useEffect }  from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import DateTime from 'react-datetime'
import Tags from "./Tags"

import { TASK, CREATE_TASK, UPDATE_TASK } from '../queries'

import '@yaireo/tagify/dist/tagify.css'
import './TaskModal.css'

const DEFAULT_TASK = {
  taskId: null,
  priority: '',
  name: '',
  notes: '',
  deadline: '',
  tags: ''
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
      <textarea name={props.name} id={props.id} onChange={props.onChange} value={props.value} />
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
      <option key={opt.value} value={opt.value}>
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

function TagsField(props) {
  const { name, label, value, onChange } = props
  const tagifySettings = {
    whitelist: []
  }
  const tagifyProps = {
    value: value ? value.split(',') : [],
    onChange
  }

  return (
    <div className="field">
      <label htmlFor={name}>{label || name}</label>
      <Tags settings={tagifySettings} {...tagifyProps} />
    </div>
  )
}


function TaskForm(props) {
  const { task: originalTask, reset } = props
  const tagSet = new Set()
  const [task, setTask] = useState(Object.assign({}, DEFAULT_TASK, originalTask))
  const [addTask] = useMutation(CREATE_TASK)
  const [saveTask] = useMutation(UPDATE_TASK)
  
  useEffect(() => {
    if (originalTask) {
      originalTask.tags.split(',').forEach(t => {
        if (t) tagSet.add(t)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function clear() {
    console.debug('clear()')
    setTask(DEFAULT_TASK)
    tagSet.clear()
  }

  const changedName = v => { setTask({ ...task, name: v.target.value }) }
  const changedPriority = v => { setTask({ ...task, priority: v.target.value }) }
  const changedNotes = v => { setTask({ ...task, notes: v.target.value }) }

  function changedDeadline(mom) {
    console.debug('changedDeadline()')
    // TODO: Allow typing in?
    if (!(mom instanceof moment)) {
      console.warn('This probably won\'t work for typing in dates')
      mom = moment(mom)
    }
    setTask({ ...task, deadline: mom.format() })
  }

  function changedTags(ev) {
    // Custom event from Tagify here
    const { value } = ev.detail.data
    if (ev.type === 'add') {
      if (tagSet.has(value)) return
      tagSet.add(value)
    } else if (ev.type === 'remove') {
      if (!tagSet.has(value)) return
      tagSet.delete(value)
    }
    // Functional update here because `task` is out of date here
    setTask((prev) => ({ ...prev, tags: [...tagSet].join(',') }))
  }

  function save(e) {
    console.debug('save()')
    e.preventDefault()
    if (task.taskId === null) {
      addTask({
        variables: {
          taskId: task.taskId,
          priority: task.priority || 30,
          name: task.name,
          notes: task.notes,
          deadline: task.deadline || null,
          tags: task.tags || '',
        }
      })
    } else {
      saveTask({
        variables: {
          taskId: task.taskId,
          priority: task.priority,
          name: task.name,
          notes: task.notes,
          deadline: task.deadline,
          tags: task.tags,
        }
      })
    }
    clear()
    reset()
  }

  const { name, notes, deadline, tags } = task
  return (
    <div className={`modal`}>
      <form onSubmit={save}>
        <Field id="task-name" label="Title" name="name" value={name} onChange={changedName} />
        <DateField label="Deadline" value={deadline} onChange={changedDeadline} />

        <SelectField
          label="Priority"
          name="priority"
          options={PRIORITY_OPTIONS}
          value={task.priority}
          onChange={changedPriority}
          />

        <TextField id="task-notes" label="Notes" name="notes" value={notes} onChange={changedNotes} />

        <TagsField id="task-tags" label="Tags" name="tags" value={tags} onChange={ev => changedTags(ev)} />

        <div className="button-group">
          <button type="submit" className="save">Save</button>
          <button className="close" onClick={() => { clear(); reset() }}>Close</button>
        </div>
      </form>
    </div>
  )
}


function TaskModal(props) {
  const { modalState, taskModalState, tasksRefetch } = props
  const { loading, error, data } = useQuery(TASK, {
    variables: {
      taskId: modalState
    },
    skip: modalState < 1
  })

  if (loading) return null
  if (error) {
    console.error(error)
    return null
  }
  if (modalState < 0) return null

  function reset() {
    tasksRefetch()
    taskModalState(-1)
  }
  
  return (
    <TaskForm task={data ? data.task : null} reset={reset} />
  )
}

export default TaskModal
