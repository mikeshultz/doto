import React, { useState } from "react"
import { useMutation } from "@apollo/client"

import { GOOGLE_AUTH } from "../queries"
import Field from "./Field"

import "./AddCalendarModal.css"

function AddCalendarModal(props) {
  const { modalState, setModalState } = props
  const [calendarId, setCalendarId] = useState("")
  const [error, setError] = useState("")
  const [
    googleAuth,
    { called, error: mutationError, loading, data: mutationData },
  ] = useMutation(GOOGLE_AUTH)
  console.log("mutationDatamutationDatamutationData", mutationData)
  let ok, authUrl
  if (mutationData) {
    ok = mutationData.googleAuth.ok
    authUrl = mutationData.googleAuth.authUrl
  }
  console.log("###data", ok, authUrl)

  if (modalState < 0 || loading) return null

  if (called) {
    if (ok) {
      console.log("Redirecting to google for authentication...")
      console.debug("authUrl", authUrl)
      window.location = authUrl
    } else {
      // TODO: Display to user
      console.debug(mutationError)
      console.error("Initiating auth fialed")
      setError("Unknown Error: Failed to start auth with Google")
    }
  }

  function onCalendarIDChange(ev) {
    setCalendarId(ev.target.value)
  }

  function save(ev) {
    ev.preventDefault()
    googleAuth({
      variables: {
        calendarId,
      },
    })
  }

  return (
    <div className="modal">
      <form onSubmit={save}>
        <div className={error ? "error" : "hide"}>{error}</div>
        <Field
          name="calendarid"
          label="Calendar ID (E-mail)"
          onChange={onCalendarIDChange}
        />
        <div className="button-group">
          <button type="submit" className="save">
            Save
          </button>
          <button
            className="close"
            onClick={() => {
              setCalendarId("")
              setModalState(-1)
            }}
          >
            Close
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCalendarModal
