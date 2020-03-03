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

export const GOOGLE_AUTH = gql`
mutation GoogleAuth($calendarId: ID!) {
  googleAuth(calendarId: $calendarId) {
    ok
    authUrl
  }
}
`

export const GET_CALENDARS = gql`
query Calendars($calendarId: ID) {
  calendars(calendarId: $calendarId) {
    id
    summary
    description
    selected
  }
}

`

export const GET_EVENTS = gql`
query Events($calendarId: ID) {
  events(calendarId: $calendarId) {
    id
    status
    created
    updated
    summary
    description
    colorId
    creator {
      email
      displayName
    }
    organizer {
      email
      displayName
    }
    start {
      date
      datetime
      timezone
    }
    end {
      date
      datetime
      timezone
    }
    originalStartTime {
      date
      datetime
      timezone
    }
    recurringEventId
    reminders {
      useDefault
      overrides {
        method
        minutes
      }
    }
  }
}

`

export const GET_FORECAST = gql`
query Forecast($zip: Int, $countryCode: String) {
  forecast(zip: $zip, countryCode: $countryCode) {
    city {
      name
      coord {
        lat
        long
      }
      country
    }
    points {
      datetime
      main {
        temp
        tempMin
        tempMax
        pressure
        seaLevel
        grndLevel
        humidity
        tempKf
      }
      weather {
        main
        description
        icon
      }
      clouds {
        all
      }
      wind {
        speed
        deg
      }
    }
  }
}

`
