import { omitUri } from '.'
import { Classes } from '../types/class'
import { Labels } from '../types/label'

let labels: Labels | undefined = {}

export const setLabels = (newLabels: Labels) => {
  labels = newLabels
}

export const getLabels = () => {
  return labels
}

export const getPreferredLabel = (
  uri: string,
  locale: string,
  classes?: Classes
): string => {
  const u = omitUri(uri)
  const label = labels?.[u] ?? classes?.[u]?.label
  if (!label) {
    return u
  }
  const l = label[locale] ?? label.en ?? label[''] ?? undefined
  return l ?? u
}
