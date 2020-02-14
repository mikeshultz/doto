import { gql } from 'apollo-boost'

export const TASKS = gql`
query GetTasks {
  tasks {
    id
    taskId
    priority
    name
    notes
    added
    deadline
    completed
  }
}
`

export const TASK = gql`
query GetTask ($taskId: ID!) {
  task (taskId: $taskId) {
    id
    taskId
    priority
    name
    notes
    added
    deadline
    completed
  }
}
`

export const CREATE_TASK = gql`
mutation CreateTask($priority: Int!, $name: String!, $notes: String, $deadline: String) {
  createTask(priority: $priority, name: $name, notes: $notes, deadline: $deadline) {
    ok
    task {
      id
      taskId
      name
    }
  }
}
`

export const UPDATE_TASK = gql`
mutation UpdateTask($taskId: ID!, $priority: Int!, $name: String!, $notes: String, $deadline: String) {
  updateTask(taskId: $taskId, priority: $priority, name: $name, notes: $notes, deadline: $deadline) {
    ok
    task {
      id
      taskId
      priority
      name
      notes
      deadline
    }
  }
}
`

export const COMPLETE_TASK = gql`
mutation CompleteTask($taskId: ID!) {
  completeTask(taskId: $taskId) {
    ok
    task {
      id
      taskId,
      completed
    }
  }
}
`

export const DELETE_TASK = gql`
mutation DeleteTask($taskId: ID!) {
  deleteTask(taskId: $taskId) {
    ok
  }
}
`