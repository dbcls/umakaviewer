import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { FilterAction } from '../actions/filter'

const Filter: React.FC = () => {
  const dispatch = useDispatch()

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const limit = Number(e.currentTarget.value)
        dispatch(FilterAction.filterClasses(limit))
      }
      if (!e.key.match(/[0-9]/)) {
        e.preventDefault()
      }
    },
    []
  )

  return (
    <div id="filter">
      <input type="number" onKeyPress={handleKeyPress} maxLength={4} />
    </div>
  )
}

export default Filter
