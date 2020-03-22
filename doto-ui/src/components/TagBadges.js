import React from 'react'

import './TagBadges.css'

function Badge(props) {
  const { value } = props
  return (
    <div class="badge">{value}</div>
  )
}

function TagBadges(props) {
  const { tags } = props
  if (!tags) return null
  const badges = tags.split(',').map(tag => (<Badge value={tag} />))
  return (
    <div className="badges">
      {badges}
    </div>
  )
}

export default TagBadges
