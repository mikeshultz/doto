import { gql } from "@apollo/client"

export const TASKS = gql`
  query GetTasks($taskFilter: TaskFilter) {
    tasks(taskFilter: $taskFilter) {
      id
      taskId
      priority
      name
      notes
      added
      deadline
      completed
      tags
    }
  }
`

export const TASK = gql`
  query GetTask($taskId: ID!) {
    task(taskId: $taskId) {
      id
      taskId
      priority
      name
      notes
      added
      deadline
      completed
      tags
    }
  }
`

export const CREATE_TASK = gql`
  mutation CreateTask(
    $priority: Int!
    $name: String!
    $notes: String
    $tags: String
    $deadline: String
  ) {
    createTask(
      priority: $priority
      name: $name
      notes: $notes
      tags: $tags
      deadline: $deadline
    ) {
      ok
      task {
        id
        taskId
        name
        tags
      }
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: ID!
    $priority: Int!
    $name: String!
    $notes: String
    $tags: String
    $deadline: String
  ) {
    updateTask(
      taskId: $taskId
      priority: $priority
      name: $name
      notes: $notes
      tags: $tags
      deadline: $deadline
    ) {
      ok
      task {
        id
        taskId
        priority
        name
        notes
        deadline
        tags
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
        taskId
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

export const GET_TAGS = gql`
  query Tags {
    tags
  }
`

export const GET_DEVICES = gql`
  query GetDevices($mac: ID) {
    devices(mac: $mac) {
      mac
      name
      state
    }
  }
`

export const DEVICE_ON = gql`
  mutation DeviceOn($mac: ID!) {
    deviceOn(mac: $mac) {
      ok
    }
  }
`

export const DEVICE_OFF = gql`
  mutation DeviceOff($mac: ID!) {
    deviceOff(mac: $mac) {
      ok
    }
  }
`
