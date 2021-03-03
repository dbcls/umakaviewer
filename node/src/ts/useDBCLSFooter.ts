import ReactDOM from 'react-dom'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

export const useDBCLSFooter = () => {
  const location = useLocation()
  const [copyElement, setCopyElement] = useState<HTMLElement | null>(null)
  const [resetToken, setReset] = useState<number>(0)

  const footerElement = useMemo(() => {
    const elm = document.getElementById('dbcls-common-footer')
    if (!elm) {
      setTimeout(() => {
        setReset((val) => val + 1)
      }, 200)
    }
    return elm
}, [resetToken])

  useEffect(() => {
    if (!footerElement) {
      return
    }
    ReactDOM.unstable_batchedUpdates(() => {
      const cloneNode = footerElement.cloneNode(true) as HTMLElement
      cloneNode.style.display = 'block'
      setCopyElement(cloneNode)
    })
    if (location.pathname.startsWith('/v')) {
      footerElement.style.display = 'none'
    } else {
      footerElement.style.display = 'block'
    }
  }, [location.pathname, footerElement])
  return {footerElement, copyElement}
}
