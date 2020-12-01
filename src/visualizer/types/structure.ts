export type Structure = {
  uri: string // [datatype, class] = uri.split(':')
  children?: Structure[]
}

export type NodeStructure = Structure & {
  key: number
  originalR: number
  originalX: number
  originalY: number
  children?: NodeStructure[]
  labelY?: number
  isLabelOnTop?: boolean
  pointToCenter?: boolean
  treeY?: number
  oldTreeY?: number
  delta?: number
  isMultipleInheritanceSource?: boolean
}
