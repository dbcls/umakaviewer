import React, { useCallback, useRef } from 'react'
import { NodeType, SVGEventHandlerType } from '../utils/GraphRepository'

type TimeoutId = ReturnType<typeof setTimeout>

const useDblClickHandler = (
  doubleClickHandler: SVGEventHandlerType,
  singleClickHandler?: SVGEventHandlerType,
  duration: number = 150
) => {
  const timeoutRef = useRef<TimeoutId | undefined>(undefined)
  const handleMouseDown: SVGEventHandlerType = useCallback(
    (e?: React.MouseEvent<SVGGElement, MouseEvent>, d?: NodeType) => {
      const clicked = timeoutRef.current !== undefined
      if (clicked) {
        e?.preventDefault()
        clearTimeout(timeoutRef.current!)

        doubleClickHandler(e, d)
        timeoutRef.current = undefined
      }

      const clickEventId = setTimeout(() => {
        singleClickHandler?.(e, d)
        timeoutRef.current = undefined
      }, duration)

      timeoutRef.current = clickEventId
    },
    [doubleClickHandler, singleClickHandler]
  )
  return [handleMouseDown]
}

export default useDblClickHandler
