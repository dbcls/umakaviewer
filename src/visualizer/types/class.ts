type Label = {
  [key: string]: string // key: language, value: class
}

export type ClassDetail = {
  entities?: number
  label?: Label
  subClassOf?: string[]
  rhs?: [string, string][] // Right Hand Side [uri, uri]
  lhs?: [string, string][] // Left Hand Side [uri, uri]
}

export type Classes = {
  [key: string]: ClassDetail // key: uri
}
