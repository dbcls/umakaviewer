import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../reducers'
import { LegendAction } from '../actions/legend'

const selector = ({
  detail: { showLeftHand, showRightHand, propertyClass },
  legend: { showingLegend },
}: RootState) => ({
  showLeftHand,
  showRightHand,
  propertyClass,
  showingLegend,
})

const Legend: React.FC = () => {
  const {
    showLeftHand,
    showRightHand,
    propertyClass: { domain, range },
    showingLegend,
  } = useSelector(selector)
  const dispatch = useDispatch()
  const intl = useIntl()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      dispatch(LegendAction.showLegend())
    },
    [dispatch]
  )

  const showingAnyHandLegend = useMemo(
    () => (
      <div id="legend" className="highlight">
        <h1 className="legend-label">
          {intl.formatMessage({ id: 'legend.label.legend' })}
        </h1>
        <button
          type="button"
          onClick={handleClick}
          className="hidden-toggle"
          aria-label="hidden-toggle"
        />
        <ul>
          <li>
            <span className="visual" />
            <span className="description">
              {intl.formatMessage({
                id: 'legend.same.class.inherits.from.each.other',
              })}
            </span>
          </li>
          <li>
            <span className="visual" />
            <span className="description">
              {intl.formatMessage({
                id: 'legend.triple.whose.subject.is.the.selected.class',
              })}
            </span>
          </li>
          <li>
            <span className="visual" />
            <span className="description">
              {intl.formatMessage({
                id: 'legend.triple.whose.object.is.the.selected.class',
              })}
            </span>
          </li>
          <li>
            <span className="visual" />
            <span className="description">
              {intl.formatMessage({
                id: 'legend.the.selected.class.is.the.subject',
              })}
              <br />
              {intl.formatMessage({ id: 'legend.and.object' })}
            </span>
          </li>
        </ul>
      </div>
    ),
    [intl, handleClick]
  )

  const notShowingHandLegend = useMemo(
    () => (
      <div id="legend" className="normal">
        <h1 className="legend-label">
          {intl.formatMessage({ id: 'legend.label.legend' })}
        </h1>
        <button
          type="button"
          onClick={handleClick}
          className="hidden-toggle"
          aria-label="hidden-toggle"
        />
        <ul>
          <li>
            <span className="visual" />
            <span className="description">
              {intl.formatMessage({ id: 'legend.class.with.subclass' })}
            </span>
          </li>
          <li>
            <span className="visual" />
            <span className="description">
              {intl.formatMessage({ id: 'legend.class.without.subclass' })}
            </span>
          </li>
          <li>
            <span className="visual" />
            <span className="description">
              {intl.formatMessage({ id: 'legend.class.parent' })}
            </span>
          </li>
          {(domain || range) && [
            <li key="subject">
              <span className="visual" />
              <span className="description">
                {intl.formatMessage({
                  id: 'legend.subjcet.class.of.the.selected.property',
                })}
              </span>
            </li>,
            <li key="object">
              <span className="visual" />
              <span className="description">
                {intl.formatMessage({
                  id: 'legend.object.class.of.the.selected.property',
                })}
              </span>
            </li>,
          ]}
        </ul>
      </div>
    ),
    [intl, handleClick, domain, range]
  )

  const notShowingLegend = useMemo(
    () => (
      <div id="legend" className="close">
        <h1 className="legend-label">
          {intl.formatMessage({ id: 'legend.label.legend' })}
        </h1>
        <button
          type="button"
          onClick={handleClick}
          className="hidden-toggle"
          aria-label="hidden-toggle"
        />
      </div>
    ),
    [intl, handleClick]
  )

  let legend: React.ReactNode
  if (showingLegend) {
    if (showRightHand || showLeftHand) {
      legend = showingAnyHandLegend
    } else {
      legend = notShowingHandLegend
    }
  } else {
    legend = notShowingLegend
  }

  return <div id="legend-wrapper">{legend}</div>
}

Legend.displayName = 'Legend'

export default Legend
