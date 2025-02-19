import _ from 'lodash'
import React, { useRef } from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { useContextMenu } from 'react-contexify'
import { useDispatch, useSelector } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { RootState } from '../reducers'
import { DetailState } from '../reducers/detail'
import { ClassDetail, Classes } from '../types/class'
import { isIE11 } from '../utils'
import GraphRepository, {
  NodeType,
  SVGEventHandlerType,
} from '../utils/GraphRepository'
import { getChildrenRecursive } from '../utils/node'
import { ClassNames } from '../constants/ClassStructure'
import { TooltipAction } from '../actions/tooltip'
import { Metadata } from '../types/metadata'
import {
  makeQueryWhenRightClickArrow,
  makeQueryWhenRightClickClass,
} from '../utils/sparql'
import { getPreferredLabel } from '../utils/label'

export const CIRCLE_CONTEXT_MENU_ID = 'circle-context-menu-id'

function decideNormalClass(
  d: NodeType,
  visibleNodesSet: { [key: string]: boolean }
) {
  if (d.depth === 0) {
    return ClassNames.Normal.ROOT
  }
  if (!d.children) {
    return ClassNames.Normal.LEAF
  }
  if (d.children[0].data.key in visibleNodesSet) {
    return ClassNames.Normal.NODE
  }
  return ClassNames.Normal.HIDDEN_CHILDREN
}

function breadthFirstEnumration(rootNode: NodeType, depth = 2) {
  const result = []
  const queue = []
  queue.push(rootNode)
  while (queue.length !== 0) {
    const node = queue.shift()
    if (!node || node.depth > rootNode.depth + depth) {
      break
    }
    result.push(node)
    if (node.children) {
      node.children.forEach((childNode) => {
        queue.push(childNode)
      })
    }
  }
  return result
}

function breadthFirstEnumrationForNodes(rootNodes: NodeType[]) {
  const nodes: NodeType[] = []
  const sortedRootNodes = _.sortBy(_.uniq(rootNodes), (d) => d.depth)
  sortedRootNodes.forEach((node) => {
    Array.prototype.push.apply(nodes, breadthFirstEnumration(node, 2))
  })
  return nodes
}

function getVisibleNodes(targetClassNodes: NodeType[]) {
  const route: NodeType[] = [] // targetClassNodesの先祖が全て入る
  // eslint-disable-next-line no-restricted-syntax
  for (let node of targetClassNodes) {
    route.unshift(node)
    while (node.depth > 0) {
      if (node.parent) {
        node = node.parent
        route.unshift(node)
      }
    }
  }

  const recursiveNodes = _.flatMap(route, (breadcrumb) =>
    getChildrenRecursive(breadcrumb)
  )

  // targetClassNodesの子の子
  const nodes = targetClassNodes.reduce<NodeType[]>(
    (nodeArray, child) =>
      child.children ? nodeArray.concat(child.children) : nodeArray,
    recursiveNodes
  )

  const findCompletelyStackedChildren = (node: NodeType): NodeType[] => {
    if (node.children === undefined) {
      // leaf node
      return [node]
    }
    if (node.children.length !== 1) {
      // hidden children
      return [node]
    }
    return findCompletelyStackedChildren(node.children[0]).concat([node])
  }

  return _.flatMap(
    nodes.filter((node) => node.data.isLabelOnTop),
    findCompletelyStackedChildren
  ).concat(nodes)
}

function getNodeSet(nodes: NodeType[]) {
  return nodes.reduce<{ [key: number]: boolean }>((o, node) => {
    o[node.data.key] = true // eslint-disable-line no-param-reassign
    return o
  }, {})
}

function makeArrowMouseover(
  intl: IntlShape,
  getUris: (d: NodeType) => string[]
) {
  return (event?: React.MouseEvent<SVGGElement, MouseEvent>, d?: NodeType) => {
    if (!event || !d) return

    const targetElement = event.currentTarget
    const x = Number(targetElement.getAttribute('cx')) + 10
    const y = Number(targetElement.getAttribute('cy')) + 10

    const predicateMessage = intl.formatMessage({
      id: 'classStructure.text.predicate',
    })
    const predicateLabels = getUris(d).map((uri) =>
      getPreferredLabel(uri, intl.locale)
    )
    GraphRepository.addPopup(x, y, predicateLabels, predicateMessage)

    GraphRepository.updatePosition()
  }
}

function arrowMouseout() {
  GraphRepository.removePopup()
}

type ClassStructureProps = {
  classes: Classes
  circleDiameter: number | null
  nodes: NodeType[]
  width: number | null
  height: number | null
  metadata: Metadata | null
  getReferenceURL: (uri: string | null) => string | null
}

const selector = ({ detail }: RootState) => detail

const ClassStructure: React.FC<ClassStructureProps> = (props) => {
  const {
    classes,
    metadata,
    circleDiameter,
    nodes,
    width,
    height,
    getReferenceURL,
  } = props
  const dispatch = useDispatch()
  const intl = useIntl()

  const { show } = useContextMenu({
    id: CIRCLE_CONTEXT_MENU_ID,
  })
  const handleClickTreeImg: SVGEventHandlerType = React.useCallback(() => {
    dispatch(DetailAction.showTree())
  }, [dispatch])

  const handleClickClass = React.useCallback(
    (event?: React.MouseEvent<SVGGElement, MouseEvent>, d?: NodeType) => {
      if (!d || !event || event.defaultPrevented) {
        return
      }
      dispatch(DetailAction.focusCircle(d.data.key, d.data.uri))
      dispatch(TooltipAction.hide())
    },
    [dispatch]
  )

  const handleRightClickClass = React.useCallback(
    (event?: React.MouseEvent<SVGGElement, MouseEvent>, d?: NodeType) => {
      if (!d || !event) {
        return
      }

      // コンテキストメニューは表示しない
      event?.preventDefault()

      const refUri = getReferenceURL(d?.data.uri ?? null)
      if (refUri) {
        const endpoint = metadata?.endpoint ?? ''
        const query = makeQueryWhenRightClickClass(refUri)
        show(event, { props: { endpoint, query } })
      }
    },
    [metadata?.endpoint]
  )

  const handleShowTooltip: SVGEventHandlerType = React.useCallback(
    (event?: React.MouseEvent<SVGCircleElement, MouseEvent>, d?: NodeType) => {
      if (!d || !event) {
        return
      }

      dispatch(
        TooltipAction.show(
          d.data.uri,
          event.currentTarget.getBoundingClientRect()
        )
      )
    },
    [dispatch]
  )

  const handleHideTooltip: SVGEventHandlerType = React.useCallback(() => {
    dispatch(TooltipAction.hide())
  }, [dispatch])

  // targetはpack.nodes(data)で作られたnode
  // 視点をtargetに移して、そこから見えるクラス(孫)までを表示する。
  // 結果はnodeに対して冪等
  // 見せるcircleとtextsだけ。
  const focus = React.useCallback(
    (
      targetKey: number | null,
      showRhs: boolean = false,
      showLhs: boolean = false,
      relation: [string, string] | null = null
    ) => {
      const target = GraphRepository.findKeyNode(targetKey)
      if (!target) return []

      const targetClassDetail = classes[target.data.uri]

      let rhs: string[] | undefined
      let lhs: string[] | undefined
      if (relation) {
        if (targetClassDetail.rhs) {
          rhs = targetClassDetail.rhs
            .filter((r) => {
              return relation[0] === r[0] && relation[1] === r[1]
            })
            .map((r) => r[1])
        }
        if (targetClassDetail.lhs) {
          lhs = targetClassDetail.lhs
            .filter((r) => {
              return relation[0] === r[0] && relation[1] === r[1]
            })
            .map((r) => r[0])
        }
      } else {
        if (showRhs && targetClassDetail.rhs) {
          rhs = targetClassDetail.rhs.map((r) => r[1])
        } else {
          rhs = []
        }
        if (showLhs && targetClassDetail.lhs) {
          lhs = targetClassDetail.lhs.map((r) => r[0])
        } else {
          lhs = []
        }
      }

      const isOneself =
        _.includes(rhs, target.data.uri) || _.includes(lhs, target.data.uri)
      if (rhs) _.pull(rhs, target.data.uri)
      if (lhs) _.pull(lhs, target.data.uri)

      const both = _.intersection(rhs, lhs)
      rhs = _.difference(rhs, [target.data.uri].concat(both))
      lhs = _.difference(lhs, [target.data.uri].concat(both))
      const rhsNodes = GraphRepository.nodes.filter((d) =>
        _.includes(rhs, d.data.uri)
      )
      const lhsNodes = GraphRepository.nodes.filter((d) =>
        _.includes(lhs, d.data.uri)
      )
      const bothNodes = GraphRepository.nodes.filter((d) =>
        _.includes(both, d.data.uri)
      )

      let selfNodes: NodeType[]
      if (showRhs || showLhs) {
        selfNodes = GraphRepository.nodes.filter(
          (d) => d.data.uri === target.data.uri && d !== target
        )
      } else {
        selfNodes = []
      }

      const topicNodes = selfNodes.concat(rhsNodes, lhsNodes, bothNodes)
      const visibleNodes = _.union(
        GraphRepository.topLevelNodes,
        getVisibleNodes([target]),
        getVisibleNodes(topicNodes)
      )
      const visibleNodesSet = getNodeSet(visibleNodes)
      GraphRepository.visibleNodesSet = visibleNodesSet

      GraphRepository.updateLines(selfNodes, rhsNodes, lhsNodes, bothNodes)

      GraphRepository.removeTreeImg()
      if (!showLhs && !showRhs && !relation && targetKey) {
        GraphRepository.addTreeImg(targetKey, handleClickTreeImg)
      }

      const getPredicates = (d: NodeType) => {
        const detail = targetClassDetail
        const rhsProps =
          showRhs && detail.rhs
            ? detail.rhs
                .filter((r) =>
                  relation
                    ? relation[0] === r[0] && relation[1] === r[1]
                    : r[1] === d.data.uri
                )
                .map((r) => r[0])
            : []
        const lhsProps =
          showLhs && detail.lhs
            ? detail.lhs
                .filter((r) =>
                  relation
                    ? relation[0] === r[0] && relation[1] === r[1]
                    : r[0] === d.data.uri
                )
                .map((r) => r[1])
            : []
        return [...rhsProps, ...lhsProps]
      }

      const arrowMouseover = makeArrowMouseover(intl, (d) => {
        return getPredicates(d)
      })
      const arrowRightClick = (
        event?: React.MouseEvent<SVGGElement, MouseEvent>,
        d?: NodeType
      ) => {
        if (!event || !d) return

        // コンテキストメニューは表示しない
        event?.preventDefault()

        const focusingUri = getReferenceURL(target.data.uri)!
        const targetUri = getReferenceURL(d.data.uri)!
        const predicateUris = getPredicates(d).map((p) => getReferenceURL(p)!)

        const makeTriple = (): [string, string[], string] => {
          const pathTypes = event.currentTarget?.classList
          if (pathTypes?.contains('left-hand-line')) {
            return [targetUri, predicateUris, focusingUri]
          }
          if (pathTypes?.contains('self-line')) {
            return [targetUri, predicateUris, targetUri]
          }
          return [focusingUri, predicateUris, targetUri]
        }

        const endpoint = metadata?.endpoint ?? ''
        const query = makeQueryWhenRightClickArrow(...makeTriple())
        show(event, { props: { endpoint, query } })
      }

      GraphRepository.addArrowLineEvent(
        makeArrowMouseover(intl, (d) => {
          return getPredicates(d)
        }),
        arrowMouseout,
        arrowRightClick
      )

      const selfPath: NodeType[] = isOneself ? [target] : []
      GraphRepository.updateSelfLines(
        selfPath,
        arrowMouseover,
        arrowMouseout,
        arrowRightClick
      )

      GraphRepository.avoidColidedLabel()

      GraphRepository.showNodes(
        visibleNodes,
        handleClickClass,
        handleRightClickClass
      )

      const decideClass = (d: NodeType) => {
        if (_.includes(both, d.data.uri)) {
          return 'both-relation'
        }
        if (_.includes(rhs, d.data.uri)) {
          return ClassNames.Range.LEAF
        }
        if (_.includes(lhs, d.data.uri)) {
          return ClassNames.Domain.LEAF
        }
        if (d.depth === 0) {
          return ClassNames.Normal.ROOT
        }
        if (d.data.uri === target.data.uri) {
          return ClassNames.Normal.FOCUSING
        }
        if (!d.children) {
          return ClassNames.Normal.LEAF
        }
        if (d.children[0].data.key in visibleNodesSet) {
          return ClassNames.Normal.NODE
        }
        return ClassNames.Normal.HIDDEN_CHILDREN
      }

      GraphRepository.addClass(visibleNodes, decideClass)

      return [target].concat(rhsNodes, lhsNodes, bothNodes)
    },
    [classes, handleClickClass, handleClickTreeImg, intl]
  )

  const showCircles = React.useCallback(
    (
      circles: NodeType[],
      animate: boolean,
      updateScale: boolean = true,
      transparentLabel: boolean = false
    ) => {
      if (updateScale && circles.length > 0) {
        GraphRepository.calcCircleScale(circles)
        GraphRepository.updateScale()
      }

      GraphRepository.transparentLabel = transparentLabel
      if (animate) {
        GraphRepository.updatePositionWithAnimate()
      } else {
        GraphRepository.updatePosition()
      }
      GraphRepository.hideStackedNodes()

      GraphRepository.updateCircleEvents(handleShowTooltip, handleHideTooltip)
    },
    [handleHideTooltip, handleShowTooltip]
  )

  const showPropertyClass = React.useCallback(
    (uri: string | null, domain: string | null, range: string | null) => {
      const domainNodes = domain
        ? GraphRepository.nodes.filter((d) => d.data.uri === domain)
        : []
      const rangeNodes = range
        ? GraphRepository.nodes.filter((d) => d.data.uri === range)
        : []

      const sbj = domainNodes.length > 0 ? domainNodes[0] : null
      GraphRepository.targetKey = sbj?.data?.key ?? null

      const domainClassDetail = GraphRepository.classes[domain || '']
      const rangeClassDetail = GraphRepository.classes[range || '']
      const hasNoMultipleInheritance = (classDetail: ClassDetail) =>
        classDetail &&
        (!classDetail.subClassOf ||
          (!!classDetail.subClassOf && classDetail.subClassOf.length === 1)) // 親がいるなら多重継承でないものに限る
      const canDrawTriple =
        hasNoMultipleInheritance(domainClassDetail) &&
        hasNoMultipleInheritance(rangeClassDetail)

      const arrowRightClick = (
        event?: React.MouseEvent<SVGGElement, MouseEvent>,
        d?: NodeType
      ) => {
        if (!event || !d) return

        // コンテキストメニューは表示しない
        event.preventDefault()

        const propertyUri = getReferenceURL(uri)!
        const domainUri = getReferenceURL(domain)!
        const rangeUri = getReferenceURL(range)!

        const makeTriple = (): [string, string[], string] => {
          const pathTypes = event.currentTarget?.classList
          if (pathTypes?.contains('self-line')) {
            return [domainUri, [propertyUri], domainUri]
          }
          return [domainUri, [propertyUri], rangeUri]
        }

        const endpoint = metadata?.endpoint ?? ''
        const query = makeQueryWhenRightClickArrow(...makeTriple())
        show(event, { props: { endpoint, query } })
      }

      const obj = rangeNodes.length > 0 ? rangeNodes[0] : null
      const arrowMouseover = makeArrowMouseover(intl, () => [uri || ''])
      if (domain && range && obj !== null && canDrawTriple) {
        if (domain !== range) {
          GraphRepository.updateRightLines(
            [obj],
            arrowMouseover,
            arrowMouseout,
            arrowRightClick
          )
        } else {
          GraphRepository.updateSelfLines(
            [obj],
            arrowMouseover,
            arrowMouseout,
            arrowRightClick
          )
        }
      }

      const focusRootNodes = _.union(
        getVisibleNodes(domainNodes),
        getVisibleNodes(rangeNodes)
      )
      const visibleNodes = _.union(
        GraphRepository.topLevelNodes,
        focusRootNodes
      )
      const visibleNodesSet = getNodeSet(visibleNodes)

      GraphRepository.visibleNodesSet = visibleNodesSet
      GraphRepository.showNodes(
        visibleNodes,
        handleClickClass,
        handleRightClickClass
      )
      GraphRepository.avoidColidedLabel()

      let decideClass
      if (domain === range) {
        const domainChildren = breadthFirstEnumrationForNodes(domainNodes)
        decideClass = (d: NodeType) => {
          if (d.data.uri === domain) {
            return d.children
              ? ClassNames.DomainRange.NODE
              : ClassNames.DomainRange.LEAF
          }
          if (_.includes(domainChildren, d)) {
            return ClassNames.DomainRange.LEAF
          }
          return decideNormalClass(d, visibleNodesSet)
        }
      } else {
        const domainChildren = breadthFirstEnumrationForNodes(domainNodes)
        const rangeChildren = breadthFirstEnumrationForNodes(rangeNodes)
        decideClass = (d: NodeType) => {
          if (d.data.uri && d.data.uri === domain) {
            return d.children ? ClassNames.Domain.NODE : ClassNames.Domain.LEAF
          }
          if (d.data.uri && d.data.uri === range) {
            return d.children ? ClassNames.Range.NODE : ClassNames.Range.LEAF
          }
          if (_.includes(domainChildren, d)) {
            return ClassNames.Domain.LEAF
          }
          if (_.includes(rangeChildren, d)) {
            return ClassNames.Range.LEAF
          }
          return decideNormalClass(d, visibleNodesSet)
        }
      }

      GraphRepository.addClass(visibleNodes, decideClass)
      return _.union(domainNodes, rangeNodes, focusRootNodes)
    },
    [handleClickClass]
  )

  const search = React.useCallback(
    (uri: string | null) => {
      const matchedNodes = GraphRepository.nodes.filter(
        (node) => node.data.uri === uri
      )
      const sameDepthNodes = getVisibleNodes(matchedNodes)
      const visibleNodes = _.union(
        GraphRepository.topLevelNodes,
        sameDepthNodes
      )
      const visibleNodesSet = getNodeSet(visibleNodes)

      GraphRepository.visibleNodesSet = visibleNodesSet
      GraphRepository.showNodes(
        visibleNodes,
        handleClickClass,
        handleRightClickClass
      )
      GraphRepository.avoidColidedLabel()

      const decideClass = (d: NodeType) => {
        if (d.data.uri === uri) {
          return ClassNames.Normal.SEARCHING
        }
        return decideNormalClass(d, visibleNodesSet)
      }

      GraphRepository.addClass(visibleNodes, decideClass)
      return matchedNodes
    },
    [handleClickClass]
  )

  const detail = useSelector(selector)
  const oldDetailStateRef = useRef(detail)
  const update = React.useCallback(
    (detailState: DetailState, animate: boolean) => {
      const {
        focusingURI,
        focusingCircleKey,
        showRightHand,
        showLeftHand,
        showingRelation,
        searchingURI,
        propertyClass: { domain, range, uri: propertyUri },
      } = detailState

      GraphRepository.targetKey = focusingCircleKey
      GraphRepository.updateHighlight(detailState)

      if (focusingURI) {
        if (showingRelation) {
          showCircles(
            focus(focusingCircleKey, true, true, showingRelation),
            animate,
            true,
            true
          )
          return
        }
        if (showRightHand || showLeftHand) {
          showCircles(
            focus(focusingCircleKey, showRightHand, showLeftHand),
            animate,
            true,
            true
          )
          return
        }

        showCircles(focus(focusingCircleKey), animate, true, true)
        return
      }
      if (domain || range) {
        focus(0)
        const targetNodes = showPropertyClass(propertyUri, domain, range)
        if (targetNodes.length > 0) {
          showCircles(targetNodes, animate, true, true)
          return
        }
      }
      if (searchingURI) {
        focus(0)
        const matchedNodes = search(searchingURI)
        if (matchedNodes.length === 1) {
          dispatch(
            DetailAction.focusCircle(
              matchedNodes[0].data.key,
              matchedNodes[0].data.uri
            )
          )
          return
        }

        if (matchedNodes.length > 0) {
          showCircles(matchedNodes, animate, true, true)
          return
        }
      }

      showCircles(focus(0), animate)
    },
    [classes, dispatch, focus, search, showCircles, showPropertyClass]
  )

  const onResize = React.useCallback(
    (w: number, h: number, diameter: number) => {
      const needUpdate = GraphRepository.onResize(
        w,
        h,
        diameter,
        handleHideTooltip
      )
      if (needUpdate) {
        update(detail, false)
      }
      GraphRepository.setSvgAfterResize()
    },
    [detail, handleHideTooltip, update]
  )

  React.useEffect(() => {
    GraphRepository.locale = intl.locale
    GraphRepository.classes = classes
    GraphRepository.updateNode(nodes)
    GraphRepository.removeCircles()

    GraphRepository.setSvg()
    GraphRepository.setShadow()
    GraphRepository.setSearching()
    GraphRepository.setArrowHead()

    if (isIE11) {
      setInterval(GraphRepository.forceRedrawLines, 10)
    }
  }, [isIE11, classes, nodes, intl.locale])

  const oldPropsRef = useRef({ oldWidth: width, oldHeight: height })
  const mounted = React.useRef(false)
  const updating = React.useRef(false)
  React.useEffect(() => {
    if (updating.current) {
      return
    }

    if (mounted.current) {
      const { oldWidth, oldHeight } = oldPropsRef.current
      if (width !== oldWidth || height !== oldHeight) {
        onResize(width ?? 0, height ?? 0, circleDiameter ?? 1)
      }

      const { current: oldDetail } = oldDetailStateRef
      if (
        classes ||
        width !== oldWidth ||
        height !== oldHeight ||
        detail.focusingCircleKey !== oldDetail.focusingCircleKey ||
        detail.showRightHand !== oldDetail.showRightHand ||
        detail.showLeftHand !== oldDetail.showLeftHand ||
        detail.showingRelation !== oldDetail.showingRelation ||
        detail.propertyClass.domain !== oldDetail.propertyClass.domain ||
        detail.propertyClass.range !== oldDetail.propertyClass.range ||
        detail.searchingURI !== oldDetail.searchingURI
      ) {
        updating.current = true
        GraphRepository.manuallyZoomed = false
        update(detail, true)
        updating.current = false
      }
    } else {
      mounted.current = true

      GraphRepository.initialRootCircleSize = circleDiameter ?? 1
      onResize(width ?? 0, height ?? 0, circleDiameter ?? 1)

      updating.current = true
      GraphRepository.manuallyZoomed = false
      update(detail, true)
      updating.current = false
    }

    oldPropsRef.current = { oldWidth: width, oldHeight: height }
    oldDetailStateRef.current = detail
  }, [
    circleDiameter,
    classes,
    detail,
    focus,
    handleHideTooltip,
    height,
    nodes,
    onResize,
    update,
    width,
  ])

  return (
    <>
      <g id="components">
        <defs>
          <filter id="shadow" width="150%" height="150%" />
          <filter id="searching" width="200%" height="200%" />
          <linearGradient
            id="both"
            gradientUnits="objectBoundingBox"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop offset="0.5" />
            <stop offset="0.5" />
          </linearGradient>
          <marker id="arrow-head" className="arrow-head">
            <polygon points="3,3 3,7 6.464,5" fill="#666" />
          </marker>
        </defs>
        <g id="circles" />
        <g id="lines" />
        <g id="lines-nodes" />
        <g id="texts" />
      </g>
    </>
  )
}

ClassStructure.displayName = 'ClassStructure'

export default ClassStructure
