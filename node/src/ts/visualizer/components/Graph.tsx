import * as d3 from 'd3'
import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, Item, ItemParams } from 'react-contexify'

import _ from 'lodash'
import { UiAction } from '../actions/ui'
import { Classes } from '../types/class'
import { NodeStructure, Structure } from '../types/structure'
import { RootState } from '../reducers'
import { isIE11 } from '../utils'
import { createNodeStructure } from '../utils/node'
import { NodeType } from '../utils/GraphRepository'
import Legend from './Legend'
import Breadcrumbs from './Breadcrumbs'
import ClassStructure, { CIRCLE_CONTEXT_MENU_ID } from './ClassStructure'
import { Tree } from './Tree'
import LoadingSpinner from './LoadingSpinner'
import Filter from './Filter'
import { Metadata } from '../types/metadata'
import { navigateToYasgui } from '../utils/sparql'

type GraphProps = {
  classes: Classes
  structure: Structure[]
  metadata: Metadata | null
  getReferenceURL: (uri: string | null) => string | null
}

const selector = ({
  ui: { circleDiameter, svgWidth, svgHeight },
  detail: { showTree },
}: RootState) => ({
  circleDiameter,
  svgWidth,
  svgHeight,
  showTree,
})

const ContextMenu: React.VFC = () => {
  return (
    <Menu id={CIRCLE_CONTEXT_MENU_ID}>
      <Item
        onClick={(
          e: ItemParams<{ endpoint: string; query: string; uri: string }>
        ) => {
          if (e.props) {
            const { endpoint, query } = e.props
            navigateToYasgui(endpoint, query)
          }
        }}
      >
        YASGUIで見る
      </Item>
    </Menu>
  )
}

const calcPosition = (node: NodeType, circleDiameter: number) => {
  const newNode: NodeType = node

  newNode.data.originalR = node.r
  newNode.data.originalX = node.x
  newNode.data.originalY = node.y

  if (!node.parent) {
    return newNode
  }

  if (node.parent.children?.length === 1) {
    // 自身が一人っ子だったら
    const scale = node.parent.r / (circleDiameter || 1)
    newNode.r = node.parent.r - scale * 50 // 浅い円から処理していく。親の円より小さくする。
    newNode.x = node.parent.x
    newNode.y = node.parent.y + scale * 50
    if (newNode.parent) {
      newNode.parent.data.labelY = -node.parent.r + scale * 40
      newNode.parent.data.isLabelOnTop = true
    }
  } else {
    const ratio = node.parent.r / node.parent.data.originalR
    newNode.r *= ratio
    newNode.x = node.parent.x - (node.parent.data.originalX - node.x) * ratio
    newNode.y = node.parent.y - (node.parent.data.originalY - node.y) * ratio
  }

  return newNode
}

const avoidStackedCircleRecursive = (
  nodes: NodeType[] | undefined,
  circleDiameter: number
): NodeType[] | undefined => {
  if (!nodes) {
    return undefined
  }
  return nodes.flatMap((node) => {
    const nd = calcPosition(node, circleDiameter)
    const children = avoidStackedCircleRecursive(node.children, circleDiameter)
    return !children ? [nd] : [...[nd], ...children]
  })
}

const avoidStackedCircle = (
  node: NodeType,
  circleDiameter: number
): NodeType[] => {
  const root = calcPosition(node, circleDiameter)
  const children = avoidStackedCircleRecursive(root.children, circleDiameter)
  const nodes = !children ? [root] : [...[root], ...children]
  const sortedNodes = _.sortBy(nodes, 'depth')
  sortedNodes.forEach((val, idx) => {
    // eslint-disable-next-line no-param-reassign
    val.data.key = idx
  })
  return sortedNodes
}

const Graph: React.FC<GraphProps> = (props) => {
  const { classes, structure, metadata, getReferenceURL } = props
  const { circleDiameter, svgWidth, svgHeight, showTree } = useSelector(
    selector
  )
  const [rootNode, setRootNode] = React.useState<NodeType | null>(null)
  const [sortedNodes, setSortedNodes] = React.useState<NodeType[]>([])
  const dispatch = useDispatch()

  const notifyResize = React.useCallback(() => {
    dispatch(UiAction.notifyResize())
  }, [dispatch])

  React.useEffect(() => {
    notifyResize()
    window.addEventListener('resize', notifyResize, true)
    return () => {
      window.removeEventListener('resize', notifyResize, true)
    }
  }, [notifyResize])

  React.useEffect(() => {
    if (circleDiameter && structure.length > 0 && classes && structure) {
      const diameter = circleDiameter || 1
      const pack = (data: NodeStructure) => {
        return d3.pack<NodeStructure>().size([diameter, diameter])(
          d3
            .hierarchy(data)
            .sum((d) => classes[d.uri]?.entities || 0.5) // entityが1かfalsyかで差をつける
            .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
        )
      }
      const root: NodeStructure = createNodeStructure(structure)
      const node = pack(root)
      setRootNode(node)
      const nodes = avoidStackedCircle(pack(root), circleDiameter)
      setSortedNodes(nodes)
    }
  }, [circleDiameter, classes, setRootNode, structure])

  const containerRef = useRef(null)
  return (
    <div id="graph-container" ref={containerRef}>
      <Breadcrumbs classes={classes} />
      <Filter />
      <svg
        id="classes-structure"
        viewBox={isIE11 ? `0 0 ${svgWidth} ${svgHeight}` : undefined}
      >
        {circleDiameter && rootNode && svgWidth && svgHeight && (
          <ClassStructure
            nodes={sortedNodes}
            classes={classes}
            metadata={metadata}
            circleDiameter={circleDiameter}
            width={svgWidth}
            height={svgHeight}
            getReferenceURL={getReferenceURL}
          />
        )}
      </svg>
      <Legend />
      {showTree && <Tree nodes={sortedNodes} classes={classes} />}
      <LoadingSpinner
        containerEl={containerRef.current}
        loadElSelector="circle.root"
      />
      <ContextMenu />
    </div>
  )
}

Graph.displayName = 'Graph'

export default Graph
