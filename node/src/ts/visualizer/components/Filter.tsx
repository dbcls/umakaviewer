import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { FilterAction } from '../actions/filter'
import { RootState } from '../reducers'
import { useQuery } from '../utils'

const selector = ({ filter: { showingConditions, logScale } }: RootState) => ({
  showingConditions,
  logScale,
})
const Filter: React.FC = () => {
  const { showingConditions, logScale } = useSelector(selector)
  const dispatch = useDispatch()
  const intl = useIntl()
  const query = useQuery()

  const defaultEntitiesLimit = useMemo(() => {
    const limit = Number(query.get('lower_limit')) || 1
    if (Number.isInteger(limit)) {
      return limit
    }
    return 1
  }, [])

  const handleClick = useCallback(() => {
    dispatch(FilterAction.showConditions())
  }, [])

  const handleToggleLogScale = useCallback(() => {
    dispatch(FilterAction.toggleLogScale())
    // 円の並び順（key）が変わるため、フォーカスをルートに戻す
    dispatch(DetailAction.focusCircle(0, ''))
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
            <li>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  role="switch"
                  checked={logScale}
                  onChange={handleToggleLogScale}
                />
                <span className="toggle-switch__track" aria-hidden="true" />
                <span className="toggle-switch__label">
                  {intl.formatMessage({ id: 'filter.log.scale' })}
                </span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    )
  }, [intl, logScale, handleToggleLogScale])

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
