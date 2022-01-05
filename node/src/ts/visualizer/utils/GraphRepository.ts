/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import * as d3 from 'd3'
import _ from 'lodash'
import React from 'react'
import { DetailState } from '../reducers/detail'
import { Classes } from '../types/class'
import {
  ClassNames,
  HIGHLIGHTING_MIN_SIZE,
  SHOW_TEXT_MIN_CIRCLE_DIAMETER,
  SHOW_TEXT_MAX_CIRCLE_DIAMETER,
} from '../constants/ClassStructure'
import { NodeStructure } from '../types/structure'
import {
  flattenChildren,
  getChildrenRecursive,
  getNodeUris,
  nodeKeyFn,
} from './node'
import { getPreferredLabel, isIE11 } from '.'
import SVGElementsAccessor from './SVGElementsAccessor'

export type Point = { x: number; y: number }

export type NodeType = d3.HierarchyCircularNode<NodeStructure>
export type SVGGElementType = d3.Selection<
  SVGGElement,
  NodeType,
  HTMLElement,
  any
>
export type SVGEventHandlerType = (
  e?: React.MouseEvent<SVGElement, MouseEvent>,
  d?: NodeType
) => void
type ScaleLinearType = d3.ScaleLinear<number, number>
type ZoomType = d3.ZoomBehavior<SVGGElement, NodeType>

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

const calcMoveCenter = (diameter: number, scale: number) => {
  return (diameter * scale) / 2 - diameter / 2
}

// 2点と半径から円の中心座標を求める (2点ある)
const calcCenterFromPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number
) => {
  const x3 = (x1 + x2) / 2
  const y3 = (y1 + y2) / 2
  const r2 = r ** 2
  const l1 = (x2 - x3) ** 2 + (y2 - y3) ** 2

  if (r2 < l1) {
    throw Error('Cannot calculate center of circle.')
  }

  const d = Math.sqrt(r2 / l1 - 1.0)
  const dx = d * (y2 - y3)
  const dy = d * (x2 - x3)

  const p1 = [x3 + dx, y3 - dy]
  const p2 = [x3 - dx, y3 + dy]

  return [p1, p2].sort((a, b) => b[0] - a[0] || b[1] - a[1])
}

// 円の中心座標と円周上の2点から中心角を求める
const calcCenterAngleFromPoints = (
  r: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const theta = 2 * Math.asin(distance(x1, y1, x2, y2) / (2 * r))
  return theta
}

// 基点を中心に座標を反時計回りにθ度回転させる
const rotateCoordinate = (
  x: number,
  y: number,
  refX: number,
  refY: number,
  theta: number
) => {
  const adjustedX = x - refX
  const adjustedY = y - refY
  const roratedX = Math.cos(theta) * adjustedX + -Math.sin(theta) * adjustedY
  const roratedY = Math.sin(theta) * adjustedX + Math.cos(theta) * adjustedY
  return [roratedX + refX, roratedY + refY]
}

const textBeforeEdgePolyfill = (
  element: SVGTSpanElement,
  cond: boolean | undefined
) => {
  const selection = d3.select(element)
  if (isIE11) {
    selection.attr('y', () => (cond ? '1em' : null))
  } else {
    selection.attr('dominant-baseline', () =>
      cond ? 'text-before-edge' : null
    )
  }
}

class GraphRepository {
  private _nodes: NodeType[]

  private _svg: SVGGElementType | null

  classes: Classes

  manuallyZoomed: boolean

  targetKey: number | null

  urisToHighlight: string[]

  childrenOfHighlight: NodeType[]

  visibleNodesSet: { [key: number]: boolean }

  width: number

  height: number

  initialRootCircleSize: number

  diameter: number

  coordinate: [number, number]

  ignoreEvent: Boolean

  transparentLabel: boolean

  locale: string

  pos: {
    top: number
    bottom: number
    left: number
    right: number
  }

  scale: number

  translate: [number, number]

  XLinear: ScaleLinearType | undefined

  YLinear: ScaleLinearType | undefined

  zoom: ZoomType | undefined

  timer: ReturnType<typeof setTimeout> | undefined

  constructor() {
    this._nodes = []
    this._svg = null

    this.classes = {}

    this.manuallyZoomed = false
    this.targetKey = null
    this.urisToHighlight = []
    this.childrenOfHighlight = []
    this.visibleNodesSet = {}
    this.width = 0
    this.height = 0
    this.initialRootCircleSize = 0
    this.diameter = 0
    this.coordinate = [0, 0]
    this.pos = { top: 0, bottom: 0, left: 0, right: 0 }
    this.scale = 0
    this.translate = [0, 0]
    this.XLinear = undefined
    this.YLinear = undefined
    this.zoom = undefined
    this.timer = undefined
    this.ignoreEvent = false
    this.transparentLabel = false
    this.locale = 'en'
  }

  // public accessor
  updateNode(nodes: NodeType[]) {
    this._nodes = nodes
  }

  get nodes() {
    return this._nodes
  }

  setSvg() {
    this._svg = d3.select<SVGGElement, NodeType>('#components')
  }

  setSvgAfterResize() {
    if (!this.zoom) return

    this._svg = d3
      .select<SVGGElement, NodeType>('#components')
      .call(this.zoom)
      .on('dblclick.zoom', null)
  }

  get svg() {
    return this._svg
  }

  setShadow() {
    const shadow = this.svg?.select('#shadow')

    shadow
      ?.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('result', 'blur')
      .attr('stdDeviation', 5)
    shadow?.append('feBlend').attr('in', 'SourceGraphic').attr('mode', 'normal')
  }

  setSearching() {
    const searching = this.svg?.select('#searching')

    searching
      ?.append('feGaussianBlur')
      .attr('stdDeviation', 9.5)
      .attr('in', 'SourceAlpha')
    searching
      ?.append('feOffset')
      .attr('dx', 0.5)
      .attr('dy', 0.5)
      .attr('result', 'offsetblur')
    searching
      ?.append('feFlood')
      .attr('flood-color', '#FF4F20')
      .attr('flood-opacity', 0.76)
    searching
      ?.append('feComposite')
      .attr('in2', 'offsetblur')
      .attr('operator', 'in')

    const merge = searching?.append('feMerge')
    merge?.append('feMergeNode')
    merge?.append('feMergeNode').attr('in', 'SourceGraphic')
  }

  setArrowHead() {
    const arrowHead = this.svg?.select('#arrow-head')

    arrowHead
      ?.attr('orient', 'auto-start-reverse')
      .attr('markerUnits', 'strokeWidth')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('refX', '5')
      .attr('refY', '5')
      .attr('viewBox', '0 0 10 10')
  }

  // custom accessor
  get topLevelNodes() {
    return this._nodes.filter((d) => d.depth <= 2)
  }

  get targetNode() {
    return this.targetKey ? this.nodes[this.targetKey] : null
  }

  get circles() {
    return this.svg
      ?.select('g#circles')
      .selectAll<SVGCircleElement, NodeType>('circle')
  }

  get paths() {
    const lines = this.svg?.select('g#lines')
    return {
      same: lines?.selectAll<SVGPathElement, NodeType>('path.same-line'),
      rightHand: lines?.selectAll<SVGPathElement, NodeType>(
        'path.right-hand-line'
      ),
      leftHand: lines?.selectAll<SVGPathElement, NodeType>(
        'path.left-hand-line'
      ),
      both: lines?.selectAll<SVGPathElement, NodeType>('path.both-line'),
      self: lines?.selectAll<SVGPathElement, NodeType>('path.self-line'),
    }
  }

  get texts() {
    const texts = this.svg?.select('g#texts')
    return texts?.selectAll<SVGTextElement, NodeType>('text')
  }

  get gtexts() {
    const texts = this.svg?.select('g#texts')
    return texts?.selectAll<SVGGElement, NodeType>('g')
  }

  get popups() {
    return this.svg?.selectAll<HTMLElement, Point>('.popup')
  }

  // accesor modoki
  isShowNodeText(node: NodeType) {
    const { scale } = this
    return (
      node.r * scale >= SHOW_TEXT_MIN_CIRCLE_DIAMETER &&
      this.pos.left - this.coordinate[0] / scale <= node.x &&
      node.x <= this.pos.right - this.coordinate[0] / scale &&
      this.pos.top - this.coordinate[1] / scale <= node.y &&
      node.y <= this.pos.bottom - this.coordinate[1] / scale
    )
  }

  x(x: number) {
    return (this.XLinear?.(x) ?? 0) + this.coordinate[0]
  }

  y(y: number) {
    return (this.YLinear?.(y) ?? 0) + this.coordinate[1]
  }

  textY(d: NodeType) {
    return this.y(d.y + (d.data.labelY ?? 0))
  }

  r(r: number) {
    return r * this.scale
  }

  // utillity
  findUriNode(uri: string | null) {
    if (!uri) return undefined
    return _.find(this.nodes, (node) => node.data.uri === uri)
  }

  findKeyNode(key: number | null) {
    if (key === null) return undefined
    return _.find(this.nodes, (node) => node.data.key === key)
  }

  // d3.js
  onResize(
    width: number,
    height: number,
    diameter: number,
    handleHideTooltip: SVGEventHandlerType
  ) {
    this.width = width
    this.height = height
    this.diameter = diameter
    this.XLinear = d3.scaleLinear().range([0, this.width])
    this.YLinear = d3.scaleLinear().range([0, this.height])

    const ratio = this.diameter / this.initialRootCircleSize
    const zoom = d3
      .zoom<SVGGElement, NodeType>()
      .scaleExtent([ratio, Infinity])
      // eslint-disable-next-line func-names
      .on('zoom', (event, d) => {
        if (this.ignoreEvent) {
          return
        }
        this.manuallyZoomed = true
        this.scale = event.transform.k
        this.translate = [event.transform.x, event.transform.y]
        this.transparentLabel = false

        this.updateScale()
        this.updatePosition()
        const [x, y] = d3.pointer(document.body)
        if (x && y) {
          const nodeOnCursor = document.elementFromPoint(x, y)
          if (this.timer) {
            clearTimeout(this.timer)
          }
          this.timer = setTimeout(() => {
            const selection = d3.select<Element | null, NodeType>(nodeOnCursor)
            const datum = selection.datum()
            if (
              selection &&
              datum.data.uri &&
              !this.urisToHighlight.includes(d.data.uri)
            ) {
              handleHideTooltip(undefined, datum)
            }
            this.hideStackedNodes()
          }, 100)
        }
      })
    this.zoom = zoom

    let needUpdate = false
    if (!this.manuallyZoomed) {
      needUpdate = true
    }

    return needUpdate
  }

  updateHighlight(detail: DetailState) {
    const { classes } = this
    const { showRightHand, showLeftHand } = detail
    const target = this.targetNode

    const rhs =
      showRightHand && target && classes[target.data.uri]?.rhs
        ? classes[target.data.uri]?.rhs?.map((r) => r[1])
        : []
    const lhs =
      showLeftHand && target && classes[target.data.uri]?.lhs
        ? classes[target.data.uri]?.lhs?.map((l) => l[0])
        : []
    const highlightCandidates = _.union(
      [
        detail.searchingURI,
        detail.propertyClass.domain,
        detail.propertyClass.range,
        detail.focusingURI,
      ],
      rhs,
      lhs
    )
    const nodesToHighlight = this.nodes
      .filter((node) => highlightCandidates.includes(node.data.uri))
      .filter((node) => node.data.key !== 0)

    this.urisToHighlight = getNodeUris(nodesToHighlight)
    this.childrenOfHighlight = _.flatMap(nodesToHighlight, flattenChildren)
  }

  updateLines(
    sameNodes: NodeType[],
    rhsNodes: NodeType[],
    lhsNodes: NodeType[],
    bothNodes: NodeType[]
  ) {
    const { paths } = this

    const sameLines = paths.same?.data(sameNodes, nodeKeyFn)
    sameLines?.enter().append('path').attr('class', 'same-line')
    sameLines?.exit().remove()

    const rightLines = paths.rightHand?.data(rhsNodes, nodeKeyFn)
    rightLines
      ?.enter()
      .append('path')
      .attr('class', 'arrow-line-base right-hand-line')
      .attr('marker-end', 'url(#arrow-head)')
    rightLines?.exit().remove()

    const leftLines = paths.leftHand?.data(lhsNodes, nodeKeyFn)
    leftLines
      ?.enter()
      .append('path')
      .attr('class', 'arrow-line-base left-hand-line')
      .attr('marker-end', 'url(#arrow-head)')
    leftLines?.exit().remove()

    const bothLines = paths.both?.data(bothNodes, nodeKeyFn)
    bothLines
      ?.enter()
      .append('path')
      .attr('class', 'arrow-line-base both-line')
      .attr('marker-start', 'url(#arrow-head)')
      .attr('marker-end', 'url(#arrow-head)')
    bothLines?.exit().remove()
  }

  updateRightLines(
    nodes: NodeType[],
    handleRightClick: SVGEventHandlerType = () => {}
  ) {
    const rightLines = this.paths.rightHand?.data(nodes, nodeKeyFn)
    rightLines
      ?.enter()
      .append('path')
      .attr('class', 'arrow-line-base right-hand-line')
      .attr('marker-end', 'url(#arrow-head)')
      .on('contextmenu', handleRightClick)
    rightLines?.exit().remove()
  }

  updateSelfLines(
    nodes: NodeType[],
    handleMouseOver: SVGEventHandlerType = () => {},
    handleMouseOut: SVGEventHandlerType = () => {},
    handleRightClick: SVGEventHandlerType = () => {}
  ) {
    const selfLines = this.paths.self?.data(nodes, nodeKeyFn)
    selfLines
      ?.enter()
      .append('path')
      .attr('class', 'arrow-line-base self-line')
      .attr('marker-end', 'url(#arrow-head)')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('contextmenu', handleRightClick)
    selfLines?.exit().remove()
  }

  removeTreeImg() {
    this.svg?.select('g#texts image').remove()
  }

  addTreeImg(targetKey: number | null, handleClick: SVGEventHandlerType) {
    const imageSize = 20
    this.gtexts
      ?.filter((d) => d.data.key === targetKey)
      .append('image')
      .attr('width', imageSize)
      .attr('height', imageSize)
      .attr('xlink:href', '/static/images/icon-tree.png')
      .on('click', handleClick)
  }

  addPopup(x: number, y: number, predicates: string[], message: string) {
    const popup = this.popups?.data([{ x, y }])
    const div = popup
      ?.enter()
      .append('foreignObject')
      .attr('width', 1000)
      .attr('height', 1000)
      .attr('class', 'popup')
      .append('xhtml:div')
      .attr('width', '100px')
      .attr('height', '100px')

    div?.append('h1').text(message)
    div
      ?.append('ul')
      .selectAll('li')
      .data(_.uniq(predicates))
      .enter()
      .append('li')
      .text((d) => d)

    popup?.exit().remove()
  }

  removePopup() {
    const popup = this.popups?.data([])
    popup?.exit().remove()
  }

  updateScale() {
    const { scale, translate } = this

    const x = this.width * 0.5
    const y = this.height * 0.5
    this.pos.left = (-this.width * 0.5) / scale + x
    this.pos.right = (this.width * 0.5) / scale + x
    this.pos.top = (-this.height * 0.5) / scale + y
    this.pos.bottom = (this.height * 0.5) / scale + y
    this.XLinear?.domain([this.pos.left, this.pos.right])
    this.YLinear?.domain([this.pos.top, this.pos.bottom])
    const moveCenterX = calcMoveCenter(this.width, scale)
    const moveCenterY = calcMoveCenter(this.height, scale)
    const coordinateX = translate[0] + moveCenterX
    const coordinateY = translate[1] + moveCenterY
    this.coordinate = [coordinateX, coordinateY]
  }

  get svgAccessorWithAnimate() {
    const svg = (this.svg
      ?.transition()
      .duration(750) as unknown) as SVGGElementType
    return new SVGElementsAccessor(svg)
  }

  get svgAccessor() {
    return new SVGElementsAccessor(this.svg!)
  }

  updatePositionWithAnimate() {
    this.updatePositionByContext(this.svgAccessorWithAnimate)
  }

  updatePosition() {
    this.updatePositionByContext(this.svgAccessor)
  }

  updatePositionByContext(ctx: SVGElementsAccessor) {
    // circle
    const { circles } = ctx
    circles
      .attr('cx', (d) => this.x(d.x))
      .attr('cy', (d) => this.y(d.y))
      .attr('r', (d) => {
        const minSize = this.urisToHighlight.includes(d.data.uri)
          ? HIGHLIGHTING_MIN_SIZE / 2
          : 0
        return Math.max(this.r(d.r), minSize)
      })

    this.svgAccessor.circles.sort((a, b) => {
      const compareBy = (f: (x: NodeType) => boolean | number) => {
        const fa = f(a)
        const fb = f(b)
        if (fa > fb) {
          return 1
        }
        if (fa < fb) {
          return -1
        }
        return 0
      }
      return (
        compareBy((d: NodeType) => this.childrenOfHighlight.includes(d)) ||
        compareBy((d: NodeType) => d.depth)
      )
    })

    // texts
    // Firefoxはdisplay:noneな要素にgetBoundingClientRectできない
    const { scale, transparentLabel } = this

    // ctxがd3.Transitionを返すときにvisibilityTexts.dataがundefinedになるので、アクセサを呼び分ける
    const filterVisibilityTexts = (accessor: SVGElementsAccessor) =>
      accessor.gtexts
        ?.filter((d) => {
          return (
            this.targetKey === d.data.key ||
            !d.children ||
            !(d.children[0].data.key in this.visibleNodesSet) ||
            d.r * scale <= SHOW_TEXT_MAX_CIRCLE_DIAMETER
          )
        })
        .filter((d) => this.isShowNodeText(d))

    ctx.gtexts.style('visibility', 'hidden').style('opacity', 0)

    const visibilityTextsCtx = filterVisibilityTexts(ctx)
    const labelOpacity = transparentLabel ? 0.6 : 1
    const shouldBeOpaqueLabel = (d: NodeType) =>
      d.data.key === this.targetKey || this.urisToHighlight.includes(d.data.uri)
    visibilityTextsCtx
      .attr('class', '')
      .style('visibility', 'visible')
      .style('opacity', (d) => (shouldBeOpaqueLabel(d) ? 1 : labelOpacity))
      .attr('transform', (d) => `translate(${this.x(d.x)}, ${this.textY(d)})`)
      .selectAll('tspan')
      .attr('x', 0)

    const visibilityTexts = filterVisibilityTexts(this.svgAccessor)
    if (typeof visibilityTexts?.data === 'function') {
      // Leafノードでない && クラス単位で最上位にあたるノードを強調表示
      const data = visibilityTexts.data()
      const getUpperParent = (d: NodeType): NodeType => {
        if (
          d.parent &&
          d.parent.depth > 0 &&
          _.find(data, (node) => node.data.uri === d.parent?.data.uri) !==
            undefined
        ) {
          return getUpperParent(d.parent)
        }
        return d
      }
      const upperParents = data.reduce<NodeType[]>(
        (acc, d) => acc.concat([getUpperParent(d)]),
        []
      )
      const upperParentUris = new Set(upperParents.map((v) => v.data.uri))
      visibilityTextsCtx
        .filter(
          (d) =>
            this.targetKey !== d.data.key &&
            !!d.children &&
            upperParentUris.has(d.data.uri)
        )
        .attr('class', 'emphasized-class')
    }

    // tree img
    const imageSize = 20
    ctx.gtexts
      ?.selectAll<SVGImageElement, NodeType>('image')
      .attr('x', (d, i, g) => {
        if (!d) return 0 // prevention: unused parameter error
        const textRect = g[i].parentElement
          ?.getElementsByTagName('text')[0]
          .getBoundingClientRect()
        return (textRect?.width ?? 0) / 2 + imageSize
      })
      .attr('y', (d) => (d.data.isLabelOnTop ? 0 : -imageSize / 2))

    // popup
    this.popups?.attr('x', ({ x }) => x).attr('y', ({ y }) => y)

    const f = this.targetNode
    if (!f) return

    // lines
    // const { paths } = this
    const makeArrowNode = (x: number, y: number) => {
      const r = 3.5
      const moveToStart = `M${x - r},${y}`
      const drawUppperHalf = `A${r},${r} 0,1,0 ${x + r},${y}`
      const drawBottomHalf = `A${r},${r} 0,1,0 ${x - r},${y}`
      const moveToOrigin = `M${x},${y}`
      return `${moveToStart} ${drawUppperHalf} ${drawBottomHalf} ${moveToOrigin}`
    }

    const makeArrowLineToCenter = (from: NodeType, to: NodeType) => {
      // 中心から中心を指す
      const fromX = this.x(from.x)
      const fromY = this.y(from.y)
      const toX = this.x(to.x)
      const toY = this.y(to.y)
      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2
      const drawNode = makeArrowNode(midX, midY)
      return `M${fromX},${fromY} ${midX},${midY} ${drawNode} ${toX},${toY}`
    }

    const makeArrowLineToSide = (
      from: NodeType,
      to: NodeType,
      calculatedDistance?: number
    ) => {
      const dist = calculatedDistance ?? distance(from.x, from.y, to.x, to.y)

      // 辺から辺を指す
      const cutFrom = (dist - from.r) / dist
      const fromX = this.x((from.x - to.x) * cutFrom + to.x)
      const fromY = this.y((from.y - to.y) * cutFrom + to.y)
      const cutTo = (dist - to.r) / dist
      const toX = this.x((to.x - from.x) * cutTo + from.x)
      const toY = this.y((to.y - from.y) * cutTo + from.y)
      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2
      const drawNode = makeArrowNode(midX, midY)
      return `M${fromX},${fromY} ${midX},${midY} ${drawNode} ${toX},${toY}`
    }

    const minSpaceBetweenCircles = (10 / scale) * 2
    const makeArrowLine = (from: NodeType, to: NodeType) => {
      const dist = distance(from.x, from.y, to.x, to.y)

      // 小数点精度の問題か何かでまれに誤って判定されることがあったので余白を設ける
      const shouldPointToCenter = dist < from.r + to.r + minSpaceBetweenCircles
      if (shouldPointToCenter) {
        return makeArrowLineToCenter(from, to)
      }

      return makeArrowLineToSide(from, to, dist)
    }

    ctx.paths.rightHand.attr('d', (d) => {
      return makeArrowLine(f, d)
    })
    ctx.paths.leftHand.attr('d', (d) => {
      d.data.pointToCenter = true
      return makeArrowLine(d, f)
    })
    ctx.paths.both.attr('d', (d) => {
      d.data.pointToCenter = true
      return makeArrowLine(f, d)
    })
    ctx.paths.same.attr('d', (d) => {
      return makeArrowLineToSide(f, d)
    })

    const makeArrowLineToSelf = (node: NodeType) => {
      // 4時から11時の方向を指す
      const nodeR = node.r * 1.02
      const fourOclock = Math.PI / 6
      const fromX = this.x(node.x + nodeR * Math.cos(fourOclock))
      const fromY = this.y(node.y + nodeR * Math.sin(fourOclock))
      const elevenOclock = (-Math.PI * 4) / 6
      const toX = this.x(node.x + nodeR * Math.cos(elevenOclock))
      const toY = this.y(node.y + nodeR * Math.sin(elevenOclock))

      // 節を描画するために矢印の中点を求める
      const lineR = this.r(node.r * 1.1)
      const lineC = calcCenterFromPoints(fromX, fromY, toX, toY, lineR)[0]
      const angle = calcCenterAngleFromPoints(lineR, fromX, fromY, toX, toY)
      const theta = angle / 2 + Math.PI
      const lineMid = rotateCoordinate(fromX, fromY, lineC[0], lineC[1], theta)

      const moveToStart = `M${fromX},${fromY}`
      const drawUppperHalf = `A${lineR},${lineR} 0,0,0 ${lineMid[0]},${lineMid[1]}`
      const drawNode = makeArrowNode(lineMid[0], lineMid[1])
      const drawBottomHalf = `A${lineR},${lineR} 0,0,0 ${toX},${toY}`

      return `${moveToStart} ${drawUppperHalf} ${drawNode} ${drawBottomHalf}`
    }

    ctx.paths.self.attr('d', (d) => {
      return makeArrowLineToSelf(d)
    })
  }

  addArrowLineEvent(
    handleMouseOver: SVGEventHandlerType,
    handleMouseOut: SVGEventHandlerType,
    handleRightClick: SVGEventHandlerType
  ) {
    this.svg
      ?.selectAll<SVGLineElement, NodeType>('.arrow-line-base')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('contextmenu', handleRightClick)
  }

  avoidColidedLabel() {
    if (Object.keys(this.visibleNodesSet).length === 0) return

    this.nodes.forEach((node) => {
      if (!node.data.isLabelOnTop && node.data.labelY) {
        node.data.labelY = 0
      }
    })

    const sortedNodes = _.sortBy(
      this.nodes.filter((node) => node.data.key in this.visibleNodesSet),
      (node) => node.depth * -1
    ) // 深いところから処理していく

    sortedNodes.forEach((node) => {
      if (
        node.children === undefined ||
        node.depth === 0 ||
        node.data.isLabelOnTop
      ) {
        return
      }

      if (node.children?.some((child) => child.y === node.y)) {
        const scale = node.r / this.diameter
        const maxYInChildren = _.max(
          node.children
            .filter((child) => !child.data.isLabelOnTop)
            .map((child) => child.data.labelY)
        )

        node.data.labelY = (maxYInChildren ?? 0) + scale * -60
      }
    })
  }

  showNodes(
    nodes: NodeType[],
    handleClickClass: SVGEventHandlerType,
    handleRightClickClass: SVGEventHandlerType
  ) {
    this.showCircleNodes(nodes, handleClickClass, handleRightClickClass)
    this.updateScale()
    this.showTextNodes(nodes, handleClickClass)
    this.updatePosition()
  }

  showCircleNodes(
    nodes: NodeType[],
    handleClickClass: SVGEventHandlerType,
    handleRightClickClass: SVGEventHandlerType
  ) {
    const circles = this.circles?.data(nodes, nodeKeyFn)
    circles
      ?.enter()
      .append('svg:circle')
      .on('click', handleClickClass)
      .on('contextmenu', handleRightClickClass)
    circles?.exit().remove()
  }

  showTextNodes(nodes: NodeType[], handleClickClass: SVGEventHandlerType) {
    const { classes, locale } = this

    const gtexts = this.gtexts?.data(
      _.sortBy(nodes, ({ depth }) => depth * -1),
      nodeKeyFn
    )

    const textAndButton = gtexts
      ?.enter()
      .append('g')
      .attr('transform', (d) => `translate(${this.x(d.x)}, ${this.textY(d)})`)
    const texts = textAndButton
      ?.append('svg:text')
      .on('click', handleClickClass)
      .attr('y', (d) => (d.data.isLabelOnTop && isIE11 ? '1em' : 0))
    // IE11はdominant-baselineをサポートしない

    texts
      ?.append('tspan')
      .text((d) => getPreferredLabel(d.data.uri, classes, locale))
      .attr('x', 0)
      .each((d, i, g) => {
        textBeforeEdgePolyfill(g[i], d.data.isLabelOnTop)
      })

    texts
      ?.filter((d) => !!classes[d.data.uri]?.entities)
      .append('tspan')
      .text((d) => {
        const detail = classes[d.data.uri]
        return detail?.entities || 1
      })
      .attr('dy', 20)
      .attr('x', 0)
      .each((d, i, g) => {
        textBeforeEdgePolyfill(g[i], d.data.isLabelOnTop)
      })

    gtexts?.order()
    gtexts?.exit().remove()
  }

  addClass(nodes: NodeType[], decideClass: (d: NodeType) => string) {
    this.circles?.data(nodes, nodeKeyFn).attr('class', decideClass)
    this.texts?.data(nodes, nodeKeyFn).attr('class', decideClass)
  }

  calcCircleScale(circles: NodeType[]) {
    const minX = Math.min.apply(
      null,
      circles.map((d) => d.x - d.r)
    )
    const maxX = Math.max.apply(
      null,
      circles.map((d) => d.x + d.r)
    )
    const minY = Math.min.apply(
      null,
      circles.map((d) => d.y - d.r)
    )
    const maxY = Math.max.apply(
      null,
      circles.map((d) => d.y + d.r)
    )
    let centerX = (minX + maxX) / 2
    let centerY = (minY + maxY) / 2
    const range = Math.max(maxX - minX, maxY - minY)
    const margin = circles.length > 1 ? HIGHLIGHTING_MIN_SIZE : 0
    const ratioToDisplay =
      circles.length === 1 && circles[0].children === undefined ? 0.7 : 1
    const scale = (this.diameter * ratioToDisplay - margin) / range
    const moveCenterX = calcMoveCenter(this.width, scale)
    const moveCenterY = calcMoveCenter(this.height, scale)
    centerX = (centerX - this.width / 2) * scale + moveCenterX
    centerY = (centerY - this.height / 2) * scale + moveCenterY

    this.scale = scale
    this.translate = [-centerX, -centerY]
    const selection = d3.select<SVGGElement, NodeType>('#components')

    const transform = d3.zoomIdentity.translate(...this.translate).scale(scale)
    // zoom.transform()を呼び出すと強制的にイベントが発行されてしまう。
    // このタイミングでupdatePosition()などが呼び出されるとアニメーションが消えてしまうので、手っ取り早くフラグを立てる。
    this.ignoreEvent = true
    this.zoom?.transform(selection, transform)
    this.ignoreEvent = false
  }

  hideStackedNodes() {
    const { classes } = this

    const isTopOfStack = (node: NodeType) => {
      return (
        node.parent && !node.parent.data.isLabelOnTop && node.data.isLabelOnTop
      )
    }

    // 重なった円の中にあってもズームアウト時に隠すべきでないnodesを返す
    const shouldBeVisibleAncestors = (node: NodeType | null): NodeType[] => {
      if (!node || node.data.key === 0) {
        return []
      }
      const visibleNodes = shouldBeVisibleAncestors(node.parent)
      if (node.children === undefined) {
        return visibleNodes
      }
      if (visibleNodes.length === 0) {
        return isTopOfStack(node) ? getChildrenRecursive(node) : []
      }
      return node.children.concat(visibleNodes)
    }

    const hiddenNodes = _.flatMap(
      this.nodes
        .filter((node) => isTopOfStack(node) && !this.isShowNodeText(node))
        .map(({ children }) => children![0]),
      flattenChildren
    )

    const focusingClassDetail = classes[this.targetNode?.data.uri || '']
    const visibleNodes = _.flatMap(
      this.nodes.filter((node) => {
        return (
          this.urisToHighlight.includes(node.data.uri) ||
          focusingClassDetail?.lhs?.find((lhs) => lhs[0] === node.data.uri) ||
          focusingClassDetail?.rhs?.find((rhs) => rhs[1] === node.data.uri)
        )
      }),
      shouldBeVisibleAncestors
    )
    const nodesToHide = _.difference(hiddenNodes, visibleNodes)

    this.circles
      ?.attr('display', (d) => (nodesToHide.includes(d) ? 'none' : 'inline'))
      .filter((d) => !!d.data.isLabelOnTop)
      .attr('class', (d, i, g) => {
        const currentClass = g[i].getAttribute('class') || ''
        if (
          ![
            ClassNames.Normal.HIDDEN_CHILDREN,
            ClassNames.Normal.NODE,
            ClassNames.Normal.LEAF,
          ].includes(currentClass)
        ) {
          return currentClass
        }
        if (d.children && !nodesToHide.includes(d.children[0])) {
          return ClassNames.Normal.NODE
        }
        if (
          d.children &&
          d.children[0].children &&
          d.children[0].children.length > 1
        ) {
          return ClassNames.Normal.HIDDEN_CHILDREN
        }
        return ClassNames.Normal.LEAF
      })
  }

  updateCircleEvents(
    handleShowTooltip: SVGEventHandlerType,
    handleHideTooltip: SVGEventHandlerType
  ) {
    this.circles
      ?.on('mouseenter', handleShowTooltip)
      .on('mousemove', handleShowTooltip)
      .on('wheel', handleShowTooltip)
      .on('mouseleave', handleHideTooltip)
  }

  forceRedrawLines() {
    // IEはmarkerの付いたpathの属性を変更しても再描画しない
    const lines = this.paths
    if (isIE11) {
      Object.values(lines).forEach((line) => {
        line?.each((d, i, g) => {
          if (!d) return // prevention: unused parameter error
          g[i].parentNode?.insertBefore(g[i], g[i])
        })
      })
    }
  }

  removeCircles() {
    this.circles?.data([]).exit().remove()
    Object.values(this.paths).forEach((path) => path?.data([]).exit().remove())
    this.texts?.data([]).exit().remove()
    this.gtexts?.data([]).exit().remove()
    this.popups?.data([]).exit().remove()
  }
}

export default new GraphRepository()
