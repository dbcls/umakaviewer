import { useLocation } from 'react-router-dom'
import locales from '../locales'
import { Classes } from '../types/class'

export const getPreferredLabel = (
  uri: string,
  classes: Classes,
  locale: string
): string => {
  const detail = classes[uri]
  const labels = detail?.label
  if (!labels) {
    return uri
  }
  const label = labels[locale] || labels.en || labels[''] || null
  return label || uri
}

export const getLocaleShortString = (): string => {
  const language =
    (window.navigator.languages && window.navigator.languages[0]) ||
    window.navigator.language ||
    window.navigator.userLanguage ||
    window.navigator.browserLanguage ||
    'ja' // default
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
