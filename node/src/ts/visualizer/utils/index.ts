import { useLocation } from 'react-router-dom'
import locales from '../locales'

export const omitUri = (uri: string) => {
  if (!uri) return uri

  // Do not allow endwith '#' or '/' because fragment or path will be empty.
  const uriWithoutEndDelim = uri.replace(/[#,/]$/, '')

  if (uriWithoutEndDelim.lastIndexOf('#') > -1) {
    const fragment = uri.split('#').slice(-1)[0]
    return fragment
  }

  const uriWithoutScheme = uriWithoutEndDelim.split('://').slice(-1)[0]
  if (uriWithoutScheme.lastIndexOf('/') > -1) {
    const path = uriWithoutScheme.split('/').slice(-1)[0]
    return path
  }

  return uri
}

export const getLocaleShortString = (): string => {
  const language =
    (window.navigator.languages && window.navigator.languages[0]) ||
    window.navigator.language ||
    window.navigator.userLanguage ||
    window.navigator.browserLanguage ||
    'en'
  const locale = language.substring(0, 2)

  return locale
}

export const getLocaleMessages = (
  locale: string
): { [key: string]: string } => {
  if (locale === 'ja') {
    return locales.ja.messages
  }
  if (locale === 'en') {
    return locales.en.messages
  }
  return {}
}

export const readTextFileContent = (filePath: string) => {
  const req = new XMLHttpRequest()
  req.open('GET', filePath, false)
  req.send(null)
  return req.responseText
}

export const isIE11 = window.document.documentMode === 11

export const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}
