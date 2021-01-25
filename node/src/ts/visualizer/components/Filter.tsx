import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { FilterAction } from '../actions/filter'
import { RootState } from '../reducers'
import { useQuery } from '../utils'

const selector = ({ filter: { showingConditions } }: RootState) => ({
  showingConditions,
})
const Filter: React.FC = () => {
  const { showingConditions } = useSelector(selector)
  const dispatch = useDispatch()
  const intl = useIntl()
  const query = useQuery()

  const defaultEntitiesLimit = useMemo(() => {
    const limit = Number(query.get('limit'))
    if (Number.isInteger(limit)) {
      return limit
    }
    return 0
  }, [])

  const handleClick = useCallback(() => {
    dispatch(FilterAction.showConditions())
  }, [])

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

  const showingConditionsEl = useMemo(() => {
    return (
      <div id="filter">
        <div className="filter-header">
          <span className="legend-label">
            {intl.formatMessage({
              id: 'filter.display.condition',
            })}
          </span>
          <button
            type="button"
            className="hidden-toggle"
            onClick={handleClick}
          />
        </div>
        <div className="filter-conditions">
          <ul>
            <li>
              <span>
                {intl.formatMessage({
                  id: 'filter.show.more.than.specified.entities.prefix',
                })}
              </span>
              <input
                type="number"
                defaultValue={defaultEntitiesLimit}
                onKeyPress={handleKeyPress}
              />
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
  }, [intl])

  const noShowingConditionsEl = useMemo(() => {
    return (
      <div id="filter" className="close">
        <div className="filter-header">
          <span className="legend-label">
            {intl.formatMessage({
              id: 'filter.display.condition',
            })}
          </span>
          <button
            type="button"
            className="hidden-toggle"
            onClick={handleClick}
          />
        </div>
      </div>
    )
  }, [intl])

  const filterEl = useMemo(() => {
    if (showingConditions) {
      return showingConditionsEl
    }
    return noShowingConditionsEl
  }, [showingConditionsEl, noShowingConditionsEl, showingConditions])

  return <div id="filter-wrapper">{filterEl}</div>
}

export default Filter
