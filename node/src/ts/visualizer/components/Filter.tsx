import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { FilterAction } from '../actions/filter'

const Filter: React.FC = () => {
  const dispatch = useDispatch()
  const intl = useIntl()

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const limit = Number(e.currentTarget.value)
        dispatch(FilterAction.filterClasses(limit))
        dispatch(DetailAction.focusCircle(0, ''))
      }
      if (!e.key.match(/[0-9]/)) {
        e.preventDefault()
      }
    },
    []
  )

  return (
    <div id="filter-wrapper">
      <div className="filter-header">
        <span className="legend-label">
          {intl.formatMessage({
            id: 'filter.display.condition',
          })}
        </span>
        <button type="button" className="hidden-toggle" />
      </div>
      <div className="filter-conditions">
        <ul>
          <li>
            <span>
              {intl.formatMessage({
                id: 'filter.show.more.than.specified.entities.prefix',
              })}
            </span>
            <input type="number" onKeyPress={handleKeyPress} />
            <span>
              {intl.formatMessage({
                id: 'filter.show.more.than.specified.entities.suffix',
              })}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Filter
