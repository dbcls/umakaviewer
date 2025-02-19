import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { RootState } from '../reducers'
import { Classes } from '../types/class'
import SubjectDetail from './SubjectDetail'
import { getPreferredLabel } from '../utils/label'

type TooltipProps = {
  classes: Classes
}

const selector = ({ tooltip: { pos, uri } }: RootState) => ({
  pos,
  uri,
})

type ArrowType = 'upward' | 'downward' | 'none'

const Tooltip: React.FC<TooltipProps> = (props) => {
  const { classes } = props
  const { pos, uri } = useSelector(selector)

  const [state, setState] = useState({
    x: 0,
    y: 0,
    visible: false,
    arrowType: 'none' as ArrowType,
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
      const boundary = document
        .getElementById('classes-structure')
        ?.getBoundingClientRect()
      if (!uri || !tooltip || !pos || !boundary) {
        return
      }

      const arrowSize = 25
      const [width, height] = [tooltip.width, tooltip.height + arrowSize]

      const canPlaceOnTop = boundary.top <= pos.top - height
      const canPlaceOnBottom = pos.bottom + height <= boundary.bottom

      const x = (pos.left + pos.right - width) / 2
      const outOfLeftBoundary = x < boundary.left
      const outOfRightBoundary = boundary.right < x + width

      if (
        (canPlaceOnTop || canPlaceOnBottom) &&
        !outOfLeftBoundary &&
        !outOfRightBoundary
      ) {
        setState({
          x,
          y: canPlaceOnTop ? pos.top - height : pos.bottom + arrowSize,
          visible: true,
          arrowType: canPlaceOnTop ? 'downward' : 'upward',
        })
      } else {
        const margin = 16
        setState({
          x: boundary.left + margin,
          y: boundary.bottom - (tooltip.height + margin),
          visible: true,
          arrowType: 'none',
        })
      }
    } else {
      mounted.current = true
    }
  }, [classes, pos, uri])

  const intl = useIntl()
  const { x, y, visible, arrowType } = state
  const tooltipElement = useMemo(() => {
    if (!uri) {
      return null
    }

    const detail = classes[uri]
    const entities = detail?.entities
    const preferredLabel = getPreferredLabel(uri, intl.locale, classes)
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
        <div className={`arrow ${arrowType}`} />
      </div>
    )
  }, [uri, intl.locale, classes, x, y, visible, arrowType])

  return tooltipElement
}

export default Tooltip
