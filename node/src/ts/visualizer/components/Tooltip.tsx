import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { RootState } from '../reducers'
import { Classes } from '../types/class'
import SubjectDetail from './SubjectDetail'
import { getPreferredLabel } from '../utils'

type TooltipProps = {
  classes: Classes
}

const selector = ({ tooltip: { pos, uri } }: RootState) => ({
  pos,
  uri,
})

const Tooltip: React.FC<TooltipProps> = (props) => {
  const { classes } = props
  const { pos, uri } = useSelector(selector)

  const [state, setState] = useState({
    x: 0,
    y: 0,
    visible: false,
    isOnBottom: false,
  })

  const mounted = useRef(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const oldTooltipStateRef = useRef({ uri })
  useEffect(() => {
    if (mounted.current) {
      const { uri: oldUri } = oldTooltipStateRef.current
      if (uri === oldUri) {
        return
      }

      setState({ ...state, visible: false })
      oldTooltipStateRef.current = { uri }

      const tooltip = tooltipRef.current?.getBoundingClientRect()
      if (!uri || !tooltip || !pos) {
        return
      }

      const dbclsHeaderHeight = 24 + 8
      const arrowSize = 25
      const topMarginRequired = tooltip.height + arrowSize + dbclsHeaderHeight
      const onBottom = pos.top < topMarginRequired

      setState({
        x: (pos.left + pos.right - tooltip.width) / 2,
        y: onBottom
          ? pos.bottom + arrowSize
          : pos.top - (tooltip.height + arrowSize),
        visible: true,
        isOnBottom: onBottom,
      })
    } else {
      mounted.current = true
    }
  }, [classes, pos, uri])

  const intl = useIntl()
  const { x, y, visible, isOnBottom } = state
  const tooltipElement = useMemo(() => {
    if (!uri) {
      return null
    }

    const detail = classes[uri]
    const entities = detail?.entities
    const preferredLabel = getPreferredLabel(uri, classes, intl.locale)
    return (
      <div
        ref={tooltipRef}
        id="tooltip"
        style={{
          top: y,
          left: x,
          visibility: visible ? 'visible' : 'hidden',
        }}
      >
        <div className="detail">
          <h4>{preferredLabel}</h4>
          <p>{entities !== undefined ? `(${entities} entities)` : null}</p>
        </div>
        <div className="uri">
          <h4>URI</h4>
          <p>{uri}</p>
        </div>
        <SubjectDetail classes={classes} uri={uri} />
        <div className={`arrow ${isOnBottom ? 'upward' : 'downward'}`} />
      </div>
    )
  }, [uri, intl.locale, classes, x, y, visible, isOnBottom])

  return tooltipElement
}

export default Tooltip
