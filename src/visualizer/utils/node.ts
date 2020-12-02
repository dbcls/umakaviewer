import _ from 'lodash'
import { Structure, NodeStructure } from '../types/structure'
import { NodeType } from './GraphRepository'

const falsyStructure: NodeStructure = {
  key: 0,
  originalR: 0,
  originalX: 0,
  originalY: 0,
  uri: '',
}

const mapFalsyValToStructure = (
  structure: Structure[] | undefined
): NodeStructure[] | undefined => {
  if (!structure) {
    return undefined
  }

  const nodeStructure = structure.map<NodeStructure>((element, index) => {
    const { uri } = element
    const children = mapFalsyValToStructure(structure[index].children)

    if (children) {
      return { ...falsyStructure, uri, children }
    }

    return { ...falsyStructure, uri }
  })

  return nodeStructure
}

export const createNodeStructure = (structure: Structure[]): NodeStructure => {
  const children = mapFalsyValToStructure(structure)
  return {
    ...falsyStructure,
    children,
  }
}

export const flattenChildren = (node: NodeType): NodeType[] => {
  if (node.children === undefined) {
    return [node]
  }
  return _.flatMap(node.children, flattenChildren).concat([node])
}

export const flattenParents = (node: NodeType): NodeType[] => {
  return (node.parent ? flattenParents(node.parent) : []).concat([node])
}

export const getChildrenRecursive = (node: NodeType) => {
  return _.flatMap(node.children, (child) =>
    [child].concat(child.children || [])
  )
}

export const getParentsRecursive = (node: NodeType): NodeType[] => {
  return node.parent ? getParentsRecursive(node.parent).concat(node.parent) : []
}

export const getRootNode = (node: NodeType): NodeType => {
  if (node.depth === 1) {
    return node
  }
  return node.parent ? getRootNode(node.parent) : node
}

export const getLinealAscendantNodes = (node: NodeType): NodeType[] => {
  return getParentsRecursive(node).filter((d) => d.depth > 0)
}

export const isLinealChildren = (node: NodeType, focusingCircle: NodeType) =>
  !!node.parent && node.parent.data.uri === focusingCircle.data.uri

export const calcDepthDiff = (upperNode: NodeType, node: NodeType) =>
  upperNode.depth - node.depth

export const getNodeUris = (nodes: NodeType[]) =>
  nodes.map((node) => node.data.uri)

export const hasChildren = (node: NodeType) => node.children !== undefined
export const hasParent = (node: NodeType) =>
  !!node.parent && node.parent.data.key !== 0

export const nodeKeyFn = (d: NodeType) => d.data.key
