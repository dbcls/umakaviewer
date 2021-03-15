import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers'
import { Classes } from '../types/class'
import SubjectDetail from './SubjectDetail'

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

      if (uri !== oldUri) {
        setState({ ...state, visible: false })

        if (uri && !state.visible) {
          const tooltip = tooltipRef.current?.getBoundingClientRect()

          if (tooltip && pos) {
            const onBottom = pos.bottom < tooltip.height
            const arrowSize = 25

            setState({
              x: (pos.left + pos.right - tooltip.width) / 2,
              y: onBottom
                ? pos.bottom + arrowSize
                : pos.top - tooltip.height - arrowSize,
              visible: true,
              isOnBottom: onBottom,
            })
          }
        }
      }

      oldTooltipStateRef.current = { uri }
    } else {
      mounted.current = true
    }
  }, [classes, pos, uri])

  return (
    <div
      ref={tooltipRef}
      id="tooltip"
      style={{
        top: state.y,
        left: state.x,
        visibility: state.visible ? 'visible' : 'hidden',
      }}
    >
      <h4>URI</h4>
      <p>{uri}</p>
      <SubjectDetail classes={classes} uri={uri} />
      <div className={`arrow ${state.isOnBottom ? 'upward' : 'downward'}`} />
    </div>
  )
}

export default Tooltip
