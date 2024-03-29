/**
 * Originally from https://github.com/yairEO/tagify/blob/master/dist/react.tagify.js
 */
import React from "react"
import Tagify from "@yaireo/tagify"

import "@yaireo/tagify/dist/tagify.css"

class Tags extends React.Component {
  constructor(props) {
    super(props)
    this._handleRef = this._handleRef.bind(this)
    this.onChange = props.onChange ? props.onChange.bind(this) : null
  }

  componentDidMount() {
    if (this.props.value) this.component.value = this.props.value

    this.tagify = new Tagify(this.component, this.props.settings || {})
    this.tagify.on("add", this.onChange).on("remove", this.onChange)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const tagify = this.tagify

    // check if value has changed
    if (nextProps.value && nextProps.value.join() !== this.props.value.join()) {
      tagify.loadOriginalValues(nextProps.value)
      // this.tagify.addTags(nextProps.value, true, true)
      console.log("Tags changed!")
      //this.onChange({ target: { value: nextProps.value.join() }})
    }

    this.tagify.settings.whitelist = nextProps.settings.whitelist

    if (nextProps.showDropdown) {
      tagify.dropdown.show.call(tagify, nextProps.showDropdown)
      tagify.toggleFocusClass(true)
    } else if ("showDropdown" in nextProps && !nextProps.showDropdown) {
      tagify.dropdown.hide.call(tagify)
    }

    // do not allow react to re-render since the component is modifying its own HTML
    return false
  }

  _handleRef(component) {
    this.component = component
  }

  render() {
    const attrs = {
      ref: this._handleRef,
      name: this.props.name,
      className: this.props.className,
      placeholder: this.props.class,
      autoFocus: this.props.autofocus,
      value: this.props.children,
    }

    const { className } = this.props

    return React.createElement(
      "div",
      { className },
      React.createElement(
        this.props.mode,
        Object.assign({}, attrs, { defaultValue: this.props.initialValue })
      )
    )
  }
}

Tags.defaultProps = {
  value: [],
  mode: "input",
}

export default Tags
