import _ from 'lodash'
import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
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

type ClassStructureProps = {
  classes: Classes
  circleDiameter: number | null
  nodes: NodeType[]
  width: number | null
  height: number | null
}

const selector = ({ detail }: RootState) => detail

const ClassStructure: React.FC<ClassStructureProps> = (props) => {
  const { classes, circleDiameter, nodes, width, height } = props
  const dispatch = useDispatch()
  const intl = useIntl()

  const handleClickTreeImg: SVGEventHandlerType = React.useCallback(() => {
    dispatch(DetailAction.showTree())
  }, [dispatch])

  const handleClickClass: SVGEventHandlerType = React.useCallback(
    (event?: React.MouseEvent<SVGGElement, MouseEvent>, d?: NodeType) => {
      if (!d || !event || event.defaultPrevented) {
        return
      }
      dispatch(DetailAction.focusCircle(d.data.key, d.data.uri))
      dispatch(TooltipAction.hide())
    },
    [dispatch]
  )

  const handleShowTooltip: SVGEventHandlerType = React.useCallback(
    (event?: React.MouseEvent<SVGCircleElement, MouseEvent>, d?: NodeType) => {
      if (!d || !event || GraphRepository.isShowNodeText(d)) {
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

      function arrowMouseover(
        event?: React.MouseEvent<SVGGElement, MouseEvent>,
        d?: NodeType
      ) {
        if (!event || !d) return

        const targetElement = event.currentTarget

        let [x1, y1] = [0, 0]
        let [x2, y2] = [0, 0]
        if (targetElement?.getAttribute('class')?.includes('self-line')) {
          x1 = GraphRepository.x(d.x)
          y1 = GraphRepository.y(d.y)
          x2 = GraphRepository.x(d.x)
          y2 = GraphRepository.y(d.y)
        } else {
          // eslint-disable-next-line no-extra-semi
          ;[[x1, y1], [x2, y2]] = targetElement
            ?.getAttribute('d')
            ?.split(' ')
            .slice(1, 3)
            .map((xy) => xy.split(',').map(Number)) || [
            [0, 0],
            [0, 0],
          ]
        }

        const predicates: string[] = []
        if (showRhs && targetClassDetail.rhs) {
          Array.prototype.push.apply(
            predicates,
            targetClassDetail.rhs
              .filter((r) =>
                relation
                  ? relation[0] === r[0] && relation[1] === r[1]
                  : r[1] === d.data.uri
              )
              .map((r) => r[0])
          )
        }
        if (showLhs && targetClassDetail.lhs) {
          Array.prototype.push.apply(
            predicates,
            targetClassDetail.lhs
              .filter((r) =>
                relation
                  ? relation[0] === r[0] && relation[1] === r[1]
                  : r[0] === d.data.uri
              )
              .map((r) => r[1])
          )
        }

        const predicateMessage = intl.formatMessage({
          id: 'classStructure.text.predicate',
        })
        GraphRepository.addPopup(x1, y1, x2, y2, predicates, predicateMessage)

        GraphRepository.updatePosition()
      }

      const arrowMouseout = () => {
        GraphRepository.removePopup()
      }

      GraphRepository.addArrowLineEvent(arrowMouseover, arrowMouseout)

      const selfPath: NodeType[] = isOneself ? [target] : []
      GraphRepository.updateSelfLines(selfPath, arrowMouseover, arrowMouseout)

      GraphRepository.avoidColidedLabel()

      GraphRepository.showNodes(visibleNodes, handleClickClass, intl.locale)

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
    (circles: NodeType[], animate: boolean, updateScale: boolean = true) => {
      if (circles.length === 0) {
        return
      }

      if (updateScale) {
        GraphRepository.calcCircleScale(circles)
        GraphRepository.updateScale()
      }
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
    (domain: string | null, range: string | null) => {
      const domainNodes = domain
        ? GraphRepository.nodes.filter((d) => d.data.uri === domain)
        : []
      const rangeNodes = range
        ? GraphRepository.nodes.filter((d) => d.data.uri === range)
        : []
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
      GraphRepository.showNodes(visibleNodes, handleClickClass, intl.locale)
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
    [handleClickClass, intl.locale]
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
      GraphRepository.showNodes(visibleNodes, handleClickClass, intl.locale)
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
    [handleClickClass, intl.locale]
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
        propertyClass: { domain, range },
      } = detailState

      GraphRepository.targetKey = focusingCircleKey
      GraphRepository.updateHighlight(detailState)

      if (focusingURI) {
        if (showingRelation) {
          showCircles(
            focus(focusingCircleKey, true, true, showingRelation),
            animate
          )
          return
        }
        if (showRightHand || showLeftHand) {
          showCircles(
            focus(focusingCircleKey, showRightHand, showLeftHand),
            animate
          )
          return
        }

        showCircles(focus(focusingCircleKey), animate)
        return
      }
      if (domain || range) {
        focus(0)
        const subject = GraphRepository.findUriNode(domain)
        const object = GraphRepository.findUriNode(range)
        GraphRepository.targetKey = subject ? subject.data.key : null

        const domainClassDetail = classes[domain || '']
        const rangeClassDetail = classes[range || '']

        const hasNoMultipleInheritance = (classDetail: ClassDetail) =>
          classDetail &&
          (!classDetail.subClassOf ||
            (!!classDetail.subClassOf && classDetail.subClassOf.length === 1)) // 親がいるなら多重継承でないものに限る
        const canDrawTriple =
          hasNoMultipleInheritance(domainClassDetail) &&
          hasNoMultipleInheritance(rangeClassDetail)

        if (domain && range && object !== undefined && canDrawTriple) {
          if (domain !== range) {
            GraphRepository.updateRightLines([object])
          } else {
            GraphRepository.updateSelfLines([object])
          }
        }
        showCircles(showPropertyClass(domain, range), animate)
        return
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
        showCircles(matchedNodes, animate)
        return
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
    GraphRepository.classes = classes
    GraphRepository.updateNode(nodes)
    GraphRepository.removeCircles()

    GraphRepository.setSvg()
    GraphRepository.setShadow()
    GraphRepository.setSearching()
    GraphRepository.setArrowHead()

    const [nonNullWidth, nonNullHeight, nonNullDiameter] = [
      width || 0,
      height || 0,
      circleDiameter || 1,
    ]
    GraphRepository.initialRootCircleSize = nonNullDiameter

    onResize(nonNullWidth, nonNullHeight, nonNullDiameter)

    if (isIE11) {
      setInterval(GraphRepository.forceRedrawLines, 10)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, nodes])

  const oldPropsRef = useRef({ oldWidth: width, oldHeight: height })
  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (mounted.current) {
      const [nonNullWidth, nonNullHeight, nonNullDiameter] = [
        width || 0,
        height || 0,
        circleDiameter || 1,
      ]
      const { oldWidth, oldHeight } = oldPropsRef.current

      if (width !== oldWidth || height !== oldHeight) {
        onResize(nonNullWidth, nonNullHeight, nonNullDiameter)
      }

      const { current: oldDetail } = oldDetailStateRef
      if (classes) {
        if (
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
          GraphRepository.manuallyZoomed = false
          update(detail, true)
        }
      }
    } else {
      mounted.current = true
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

  const baseElement = React.useMemo(
    () => (
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
        <g id="texts" />
      </g>
    ),
    []
  )

  return baseElement
}

ClassStructure.displayName = 'ClassStructure'

export default ClassStructure
