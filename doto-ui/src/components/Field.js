import React from "react"

function Field(props) {
  const { id, name, label, type, placeholder, value, onChange } = props
  return (
    <div className="field">
      <label htmlFor={name}>{label || name}</label>
      <input
        type={type || "text"}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default Field
