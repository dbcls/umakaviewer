import en from './en'
import ja from './ja'

interface Locales {
  [key: string]: Record<string, string>
}

const LOCALES: Locales = {
  en,
  'en-US': en,
  'en-GB': en,
  ja,
  'ja-JP': ja,
}

export default LOCALES
