import { SpinnerCircularFixed } from 'spinners-react'
import React, { useEffect, useMemo, useState } from 'react'

type LoadingSpinnerProps = {
  size?: number
  containerEl: Element | null
  loadElSelector: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  const { size, containerEl, loadElSelector } = props
  const [isLoaded, setLoaded] = useState(false)
  const observer = useMemo(() => {
    return new MutationObserver((mutations) => {
      const containLoadingEl = mutations.some((mutation) => {
        const targetEl = mutation.target as HTMLElement
        const loadEl = targetEl.querySelector(loadElSelector)
        return Boolean(loadEl)
      })
      if (containLoadingEl) {
        setLoaded(true)
      }
    })
  }, [])

  useEffect(() => {
    if (containerEl) {
      observer.observe(containerEl, { childList: true, subtree: true })
    }
  }, [observer, containerEl])

  useEffect(() => {
    if (isLoaded) {
      observer.disconnect()
    }
  }, [isLoaded, observer])

  const spinnerSize = size ?? 50
  const centerStyle = `calc(50% - ${spinnerSize / 2}px)`
  return (
    <SpinnerCircularFixed
      enabled={!isLoaded}
      size={spinnerSize}
      color="#007db2"
      secondaryColor="rgba(0,0,0,0.24)"
      style={{ position: 'absolute', left: centerStyle, top: centerStyle }}
    />
  )
}

export default LoadingSpinner
