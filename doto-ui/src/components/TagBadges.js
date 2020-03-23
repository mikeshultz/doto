import React from 'react'

import Badge from './Badge'

import './TagBadges.css'

function TagBadges(props) {
  const { tags } = props
  if (!tags) return null
  const badges = tags.split(',').map(tag => (<Badge key={tag} value={tag} />))
  return (
    <div className="badges">
      {badges}
    </div>
  )
}

export default TagBadges
