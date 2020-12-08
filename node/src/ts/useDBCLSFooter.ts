import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export const useDBCLSFooter = () => {
  const location = useLocation()
  const [footerElement, setElement] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const elm = document.getElementById('dbcls-common-footer')
    if (!elm) {
      return
    }
    if (location.pathname.startsWith('/v')) {
      elm.style.display = 'none'
    } else {
      elm.style.display = 'block'
    }
    setElement(elm)
  }, [location])
  return footerElement
}

export const useDBCLSFooterOuterText = () => {
  const [footerOuterText, setText] = useState<string>('')
  useEffect(() => {
    if (footerOuterText === '') {
      const footerElement = document.getElementById('dbcls-common-footer')
      if (footerElement) {
        setText(footerElement.outerHTML)
      }
    }
  }, [footerOuterText])
  return footerOuterText
}