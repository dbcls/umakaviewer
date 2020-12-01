import React, { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { UiAction } from '../actions/ui'

type HideableWrapperProps = {
  target: string
  toggleHandler: () => void
  attrs: { [key: string]: string }
  visibility: string
  icon: string
}

const HideableWrapper: React.FC<HideableWrapperProps> = (props) => {
  const { target, toggleHandler, attrs, visibility, icon, children } = props
  const dispatch = useDispatch()
  const intl = useIntl()

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const { current } = ref
    current?.addEventListener('animationend', () => {
      dispatch(UiAction.notifyResize())
    })

    return () => {
      // アンマウント時の処理
      current?.removeEventListener('animationend', () => {
        dispatch(UiAction.notifyResize())
      })
    }
  }, [dispatch])

  const toggleMessageId =
    visibility === 'hidden'
      ? 'hideableWrapper.toggle.open'
      : 'hideableWrapper.toggle.close'
  return (
    <div className={visibility} ref={ref} {...attrs}>
      <div
        className="hide-button"
        onClick={toggleHandler}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
      >
        <img
          src={`/static/images/icon-${
            visibility === 'hidden' ? `show-${icon}` : 'hide'
          }-pane.png`}
          alt="toggle-icon"
        />
        <span>{intl.formatMessage({ id: toggleMessageId }, { target })}</span>
      </div>
      {children}
    </div>
  )
}

export default HideableWrapper
