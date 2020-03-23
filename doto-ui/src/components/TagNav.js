import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GET_TAGS } from '../queries'
import Badge from './Badge'

function TagNav(props) {
  const { addFilter, clearFilter, currentFilter } = props
  const { loading, error, data, refetch } = useQuery(GET_TAGS)

  if (error) {
    console.error(error)
  }
  if (loading || error || !data || !data.tags) return null

  function filterByTag(tag) {
    addFilter({
      tag
    })
  }

  const tagEls = data.tags.map(tag => <Badge key={tag} value={tag} onClick={() => filterByTag(tag)} />)

  if (currentFilter) {
    tagEls.push(
      <Badge key="clear" value={'❌ Clear'} bgoverride="#cfcfcf"
        onClick={() => { clearFilter(); refetch(); }} />
    )
  }

  return (
    <ul id="tagnav">
      {tagEls}
    </ul>
  )
}

export default TagNav
