/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import * as d3 from 'd3'
import { IntlShape } from 'react-intl'
import _ from 'lodash'
import React from 'react'
import {
  DEFAULT_MAX_DEPTH,
  ANIMATION_DURATION,
  Depth,
  Margin,
} from '../constants/Tree'
import { Classes } from '../types/class'
import { TreeState } from '../components/Tree'
import { NodeType, SVGEventHandlerType } from './GraphRepository'
import { isIE11 } from '.'
import {
  calcDepthDiff,
  getNodeUris,
  hasParent,
  hasChildren,
  isLinealChildren,
  getLinealAscendantNodes,
} from './node'
import { getPreferredLabel } from './label'

export const shouldShowDisplayButton = (
  node: NodeType,
  focusingNode: NodeType
) =>
  node !== focusingNode &&
  hasChildren(node) &&
  (calcDepthDiff(node, focusingNode) === 0 ||
    isLinealChildren(node, focusingNode))
export const getTranslateX = (d: NodeType) => d.depth * Margin.X
export const getTranslateY = (d: NodeType) =>
  (d.data?.treeY ?? 0) + 35 + 12 * 2 + 6 + 20 + 8
export const getTranslateOldY = (d: NodeType) =>
  (d.data?.oldTreeY ?? 0) + 35 + 12 * 2 + 6 + 20 + 8
export const getFontSize = (e: SVGTextElement) =>
  Number(e.getAttribute('font-size') || '1')

type ProgressFnType = (progress: number) => void
type SVGElementType = d3.Selection<SVGSVGElement, NodeType, HTMLElement, any>
type SVGChildElementType = d3.Selection<
  SVGElement,
  NodeType,
  SVGSVGElement,
  NodeType
>
type SVGChildGElementType = d3.Selection<
  SVGGElement,
  NodeType,
  SVGSVGElement,
  NodeType
>

class TreeRepository {
  private _nodes: NodeType[]

  private _classes: Classes

  private _focusingCircleKey: number

  private _svg: SVGElementType | null

  flattenSubClassOf: string[]

  multipleInheritanceNodes: NodeType[]

  focusingAscendants: NodeType[]

  multipleInheritanceUris: string[]

  linealAscendantUris: string[]

  focusingAscendantUris: string[]

  appendUris: string[]

  removeUris: string[]

  moveUris: string[]

  animationKeyMap: Map<SVGChildElementType, number>

  animationFuncMap: Map<SVGElement, ProgressFnType>

  constructor() {
    this._nodes = []
    this._classes = {}
    this._focusingCircleKey = 0
    this._svg = null

    this.flattenSubClassOf = []

    this.multipleInheritanceNodes = []
    this.focusingAscendants = []
    this.multipleInheritanceUris = []
    this.linealAscendantUris = []
    this.focusingAscendantUris = []

    this.appendUris = []
    this.removeUris = []
    this.moveUris = []

    this.animationKeyMap = new Map()
    this.animationFuncMap = new Map()
  }

  get nodes() {
    return this._nodes
  }

  updateNodes(nodes: NodeType[]) {
    this._nodes = nodes
  }

  get classes() {
    return this._classes
  }

  setClasses(classes: Classes) {
    const { classes: oldClasses } = this
    this._classes = classes

    if (classes !== oldClasses) {
      this.flattenSubClassOf = Object.values(classes).reduce<string[]>(
        (acc, classDetail) => acc.concat(classDetail.subClassOf || []),
        []
      )
    }
  }

  get focusingNode() {
    return this.nodes[this._focusingCircleKey]
  }

  setFocusingNodes(key: number) {
    const { _focusingCircleKey: oldKey } = this
    this._focusingCircleKey = key

    // フォーカスノードのキーに依存するノード群を設定する
    const { focusingNode } = this
    if (key !== oldKey) {
      this.multipleInheritanceNodes = this.getMultipleInheritanceNodes(
        focusingNode
      ) // 多重継承
      const linealAscendantNodes = getLinealAscendantNodes(focusingNode) // 直系尊属
      this.focusingAscendants = _.sortBy(
        linealAscendantNodes.concat([focusingNode]),
        ({ depth }) => depth * -1
      )

      this.multipleInheritanceUris = getNodeUris(this.multipleInheritanceNodes)
      this.linealAscendantUris = getNodeUris(linealAscendantNodes)
      this.focusingAscendantUris = getNodeUris(this.focusingAscendants)
    }
  }

  getMultipleInheritanceNodes(node: NodeType) {
    const { classes, nodes, focusingNode } = this

    const classDetail = classes[node.data.uri] ?? {}
    const superClassUris = classDetail.subClassOf ?? []
    return nodes
      .filter((d) => superClassUris.includes(d.data.uri))
      .filter(
        (superClass) => focusingNode.parent?.data.uri !== superClass.data.uri
      )
  }

  findClosestFocusingAscendant(node: NodeType): NodeType | undefined {
    const { focusingAscendants } = this

    if (!node.parent) {
      return undefined
    }
    const focusingAscendant = focusingAscendants.find(
      (d) => d.data.uri === node.parent?.data.uri
    )
    return focusingAscendant || this.findClosestFocusingAscendant(node.parent)
  }

  get focusingGElement() {
    const selection = this._svg?.select<SVGGElement>('g.focusing')
    return selection?.node()
  }

  setSvg() {
    this._svg = d3.select<SVGSVGElement, NodeType>('#tree-components')
  }

  resizeSvg(width: number, height: number) {
    this._svg?.attr('width', width).attr('height', height)
  }

  removeChildGElement() {
    this._svg?.selectAll<SVGGElement, NodeType>('g').remove()
  }

  setFilters() {
    const filter = this._svg
      ?.append('filter')
      .attr('id', 'outer-circle')
      .attr('width', '200%')
      .attr('height', '200%')
    filter
      ?.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1)
    filter
      ?.append('feOffset')
      .attr('dx', 1)
      .attr('dy', 0)
      .attr('result', 'offsetblur')
    filter
      ?.append('feFlood')
      .attr('flood-color', '#444444')
      .attr('flood-opacity', 0.2)
    filter
      ?.append('feComposite')
      .attr('in2', 'offsetblur')
      .attr('operator', 'in')
    const merge = filter?.append('feMerge')
    merge?.append('feMergeNode')
    merge?.append('feMergeNode').attr('in', 'SourceGraphic')
  }

  drawClassInfos(
    intl: IntlShape,
    state: TreeState,
    depths: number[],
    handleClickShowRelationToggle: (
      e?: React.MouseEvent<SVGGElement, MouseEvent>,
      d?: number
    ) => void
  ) {
    const { focusingNode } = this
    const { maxDepth } = state

    // create class information area
    const gLabel = this._svg
      ?.selectAll<SVGGElement, number>('g.label')
      .data(depths)
      .enter()
      .append('g')
      .attr('class', 'label')
      .attr(
        'transform',
        (depth) => `translate(${(depth + focusingNode.depth) * Margin.X},0)`
      )

    // class information
    const row1 = gLabel?.append('text').attr('y', isIE11 ? '1em' : 0)
    // class relation
    row1?.append('tspan').text((depth) => {
      switch (depth) {
        case Depth.PARENT:
          return intl.formatMessage({ id: 'tree.parent.class' })
        case Depth.CHILD:
          return intl.formatMessage({ id: 'tree.child.class' })
        case Depth.GRANDCHILD:
          return intl.formatMessage({ id: 'tree.grandChild.class' })
        default:
          return ''
      }
    })
    // relation classes count
    row1
      ?.append('tspan')
      .attr('dx', 10)
      .text((depth) => {
        const formatMessage = (count: number) =>
          intl.formatMessage({ id: 'tree.number.of.classes' }, { count })
        switch (depth) {
          case Depth.PARENT: {
            const subClasses = this._classes[focusingNode.data.uri].subClassOf
            const count = subClasses ? subClasses.length : 0
            return formatMessage(count)
          }
          case Depth.CHILD: {
            const count = focusingNode.children
              ? focusingNode.children.length
              : 0
            return formatMessage(count)
          }
          case Depth.GRANDCHILD: {
            const count = _.sumBy(focusingNode.children || [], (child) =>
              child.children ? child.children.length : 0
            )
            return formatMessage(count)
          }
          default:
            return formatMessage(0)
        }
      })

    // dispay toggle of class relation
    const row2 = gLabel
      ?.append('g')
      .filter((depth) => depth > 0)
      .attr('class', (depth) => (maxDepth >= depth ? 'on' : 'off'))
      .on('click', handleClickShowRelationToggle)

    const row2Y = 20 / 2
    // toggle label
    row2
      ?.append('text')
      .attr('y', (d, i, g) =>
        d && isIE11 ? `${row2Y / getFontSize(g[i]) + 0.3}em` : row2Y
      ) // prevention: unused parameter error(datum)
      .text(intl.formatMessage({ id: 'tree.display' }))
    // toggle rect
    row2
      ?.append('rect')
      .attr('width', 56)
      .attr('height', 20)
      .attr('x', intl.locale === 'ja' ? 12 * 2 + 8 : 12 * 4 + 8)
      .attr('rx', 3) // FirefoxはCSSからrxプロパティを指定できない
      .attr('ry', 3)
    // toggle text
    row2
      ?.append('text')
      .attr(
        'x',
        intl.locale === 'ja' ? 12 * 2 + 8 + 56 / 2 : 12 * 4 + 8 + 56 / 2
      )
      .attr('y', (d, i, g) =>
        d && isIE11 ? `${row2Y / getFontSize(g[i]) + 0.3}em` : row2Y
      ) // prevention: unused parameter error(datum)
      .text((depth) => (maxDepth >= depth ? 'ON' : 'OFF'))
    // toggle transform
    row2?.attr(
      'transform',
      `translate(
          ${
            intl.locale === 'ja'
              ? (-12 * 2 - 8 - 56) / 2
              : (-12 * 4 - 8 - 56) / 2
          },
          ${12 + 6})`
    )
  }

  drawNodes(
    intl: IntlShape,
    state: TreeState,
    treeNodes: NodeType[],
    handleClickTreeNode: SVGEventHandlerType,
    handleClickShowChildToggle: SVGEventHandlerType
  ) {
    const {
      classes,
      flattenSubClassOf,
      focusingNode,
      multipleInheritanceUris,
      linealAscendantUris,
      removeUris,
      appendUris,
      moveUris,
    } = this
    const { hiddenUris, maxDepth } = state

    const svgg = this._svg
      ?.selectAll<SVGGElement, NodeType>('g.focusing, g.parent, g.normal')
      .data(treeNodes)
      .enter()
      .append('g')
      .attr(
        'transform',
        (d) => `translate(${getTranslateX(d)}, ${getTranslateY(d)})`
      )
      .attr('class', (d) => {
        if (d === focusingNode) {
          return 'focusing'
        }
        if (linealAscendantUris.includes(d.data.uri)) {
          return 'parent'
        }
        if (multipleInheritanceUris.includes(d.data.uri)) {
          return 'multiple-inheritance'
        }
        return 'normal'
      })

    svgg
      ?.filter((d) => moveUris.includes(d.data.uri))
      .attr(
        'transform',
        (d) => `translate(${getTranslateX(d)}, ${d.data.oldTreeY})`
      )
      .each((d, i, g) => {
        const updateProgress = (progress: number) => {
          const delta = (d.data.treeY ?? 0) - (d.data.oldTreeY ?? 0)
          g[i].style.transform = `translate(${getTranslateX(d)}px, ${
            getTranslateOldY(d) + progress * delta
          }px)`
        }
        this.animationFuncMap.set(g[i], updateProgress)
      })
      .classed('will-animate', true)

    const shouldAppend = (d: NodeType) => appendUris.includes(d.data.uri)
    const shouldRemove = (d: NodeType) => removeUris.includes(d.data.uri)
    const shouldAnimate = (d: NodeType) => shouldAppend(d) || shouldRemove(d)
    const shouldShowChildren = (d: NodeType) => {
      if (calcDepthDiff(d, focusingNode) >= maxDepth) {
        return (
          shouldShowDisplayButton(d, focusingNode) &&
          !hiddenUris.includes(d.data.uri)
        )
      }
      return true
    }
    const isVisibleParent = (d: NodeType) => {
      if (d.depth === 1) {
        if (d === focusingNode && maxDepth === 0) {
          return false
        }
        return true
      }

      const focusAscendant = this.findClosestFocusingAscendant(d)
      return (
        shouldShowChildren(d) &&
        !hiddenUris.includes(d.data.uri) &&
        !!focusAscendant &&
        calcDepthDiff(d, focusAscendant) <= 1
      )
    }
    const shouldDrawVertically = (d: NodeType) => {
      return (
        !d.data.isMultipleInheritanceSource &&
        !!d.children &&
        d.children.length > 1 &&
        isVisibleParent(d)
      )
    }

    const getDatumTotalLength = (
      datum: NodeType,
      index: number,
      group: SVGPathElement[] | ArrayLike<SVGPathElement>
    ) => {
      if (!datum) return 0 // prevention: unused parameter error(datum)
      return group[index].getTotalLength()
    }

    const setCommonUpdateProgress = (
      datum: NodeType,
      index: number,
      group: SVGPathElement[] | ArrayLike<SVGPathElement>
    ) => {
      const length = group[index].getTotalLength()
      const shouldDraw = !shouldRemove(datum)

      const updateProgress = (progress: number) => {
        group[index].style.strokeDashoffset = shouldDraw
          ? String(length * (1 - progress))
          : String(length * progress)
      }

      this.animationFuncMap.set(group[index], updateProgress)
    }

    const setDeltaUpdateProgress = (
      datum: NodeType,
      index: number,
      group: SVGPathElement[] | ArrayLike<SVGPathElement>
    ) => {
      if (datum.data.delta !== undefined) {
        const updateProgress =
          datum.data.delta > 0
            ? (progress: number) => {
                group[index].style.strokeDashoffset = String(
                  (datum.data.delta ?? 0) * (1 - progress)
                )
              }
            : (progress: number) => {
                group[index].style.strokeDashoffset = String(
                  (datum.data.delta ?? 0) * -1 * progress
                )
              }
        this.animationFuncMap.set(group[index], updateProgress)
      } else {
        setCommonUpdateProgress(datum, index, group)
      }
    }

    const shouldPartiallyAnimation = (node: NodeType) =>
      !!node.children &&
      node.children.reduce(
        (acc, c) => acc || moveUris.includes(c.data.uri),
        false
      )
    svgg
      ?.filter(shouldDrawVertically)
      .append('path')
      .each((d) => {
        if (shouldPartiallyAnimation(d)) {
          const lastChild = _.last(d.children)
          if (lastChild?.data.oldTreeY !== undefined) {
            d.data.delta =
              (lastChild.data.treeY ?? 0) - (lastChild.data.oldTreeY ?? 0)
          }
        }
      })
      .attr('d', (d) => {
        const lastChild = _.last(d.children)
        const y =
          d.data.delta !== undefined && d.data.delta < 0
            ? (lastChild?.data.oldTreeY ?? 0) - (d.data.treeY ?? 0)
            : (lastChild?.data.treeY ?? 0) - (d.data.treeY ?? 0)
        return `M 0 0 H ${Margin.X / 2} V ${y}`
      })
      .attr('stroke-dasharray', getDatumTotalLength)
      .attr('stroke-dashoffset', (d, i, g) => {
        if (d.data.delta !== undefined) {
          return d.data.delta > 0 ? d.data.delta : 0
        }
        if (appendUris.length > 0 && appendUris.includes(d.data.uri)) {
          return getDatumTotalLength(d, i, g)
        }
        return 0
      })
      .each(setDeltaUpdateProgress)
      .classed('will-animate', (d) => {
        const animateUris = _.union(appendUris, removeUris, moveUris)
        return (
          shouldAnimate(d) ||
          (isVisibleParent(d) &&
            getNodeUris(d.children || []).some((uri) =>
              animateUris.includes(uri)
            ))
        )
      })

    const shouldDrawHorizontally = (d: NodeType) =>
      !d.data.isMultipleInheritanceSource && hasParent(d)
    svgg
      ?.filter(shouldDrawHorizontally)
      .append('path')
      .attr('fill', 'none')
      .attr('d', (d) => {
        let x = -Margin.X / 2
        const idx = d.parent?.children?.indexOf(d)
        if (d.parent?.children?.length === 1 && idx === 0) {
          x = -Margin.X
        }
        return `M ${x} 0 H 0`
      })
      .attr('stroke-dasharray', getDatumTotalLength)
      .attr('stroke-dashoffset', (d, i, g) => {
        if (appendUris.length > 0 && appendUris.includes(d.data.uri)) {
          return g[i].getTotalLength()
        }
        return 0
      })
      .each(setCommonUpdateProgress)
      .classed('will-animate', shouldAnimate)
      .classed('will-remove', shouldRemove)

    // 'has children' dots line
    const shouldDrawChildrenDots = (d: NodeType) => {
      if (d.depth === 1) {
        return false
      }
      const focusAscendant = this.findClosestFocusingAscendant(d)
      return (
        d.children !== undefined &&
        !!focusAscendant &&
        calcDepthDiff(d, focusAscendant) === 2
      )
    }
    svgg
      ?.filter(shouldDrawChildrenDots)
      .append('path')
      .attr('d', 'M 20 0 H 50')
      .attr('stroke-dasharray', '1,3')
      .classed('will-remove', shouldRemove)

    // dots line of multiple inheritance
    const shouldBridgeMultipleInheritance =
      multipleInheritanceUris.length > 0 &&
      (_.max(focusingNode.parent?.children?.map((d) => d.data.treeY)) || [0]) >
        (focusingNode.data.treeY ?? 0)

    if (multipleInheritanceUris.length > 0) {
      const target = svgg?.filter(
        (d) =>
          !!d.data.isMultipleInheritanceSource &&
          multipleInheritanceUris.includes(d.data.uri)
      )
      const first = target?.filter((d, i, g) => d && g && i === 0)
      const remains = target?.filter((d, i, g) => d && g && i > 0)

      const branchWidth = Margin.X / 2
      const branchHeight = Margin.Y / 2
      const drawDashedPath = (
        selection: SVGChildGElementType | undefined,
        path: string,
        isBridge = false
      ) => {
        selection
          ?.append('path')
          .attr('d', path)
          .attr('stroke-dasharray', getDatumTotalLength)
          .attr('stroke-dashoffset', getDatumTotalLength)
          .each(setCommonUpdateProgress)
          .classed('will-animate', true)
        selection
          ?.append('path')
          .attr('d', path)
          .attr('class', isBridge ? 'multi-inheritance-bridge' : 'dashed')
      }
      if (shouldBridgeMultipleInheritance) {
        const bridgeRadius = 10
        const fromBridgeX = branchWidth + bridgeRadius
        const toBridgeX = branchWidth - bridgeRadius
        const horizontalPath = `M ${Margin.X} -${branchHeight} V 0 H ${fromBridgeX} A ${bridgeRadius} ${bridgeRadius} 0 1, 0 ${toBridgeX} 0 H 0`
        const verticalPath = `M ${branchWidth / 2} 0 V ${
          branchHeight * (multipleInheritanceUris.length - 1)
        }`
        const paths = [horizontalPath, verticalPath]
        paths.forEach((path) => drawDashedPath(first, path))
        drawDashedPath(remains, `M ${branchWidth / 2} 0 H 0`)
      } else {
        const horizontalPath = `M ${Margin.X} -${branchHeight} V 0 H 0`
        const verticalPath = `M ${branchWidth} 0 V ${
          branchHeight * (multipleInheritanceUris.length - 1)
        }`
        const paths = [horizontalPath, verticalPath]
        paths.forEach((path) => drawDashedPath(first, path))
        drawDashedPath(remains, `M ${branchWidth} 0 H 0`)
      }
    }

    // dots line from root to focusing node
    const isLinealAscendant = (d: NodeType) =>
      linealAscendantUris.includes(d.data.uri) || d === focusingNode
    if (focusingNode.depth > 1) {
      type NodePosition = { depth: number; shouldPolygonal: boolean; y: number }
      const focusingNodePositions: NodePosition[] = []
      const configureFocusingNodePositions = (node: NodeType | null) => {
        if (!node || node.depth === 0) {
          return
        }

        const {
          children,
          depth,
          data: { treeY },
        } = node

        const linealAscendant = children?.find((d) => isLinealAscendant(d))
        const childFocusingY = linealAscendant?.data.treeY

        const y = (childFocusingY ?? 0) - (treeY ?? 0)
        focusingNodePositions.push({
          depth,
          shouldPolygonal: !!children && children.length > 1 && y > 0,
          y,
        })
        configureFocusingNodePositions(node.parent)
      }
      svgg
        ?.filter((d) => d.depth === 1 && isLinealAscendant(d))
        .append('path')
        .attr('d', () => {
          configureFocusingNodePositions(focusingNode.parent)
          const positions = _.sortBy(focusingNodePositions, ['depth'])
          let maxX = 0
          let maxY = 0
          const path = positions.reduce((acc, { shouldPolygonal, y }) => {
            let pos
            maxY += y
            if (shouldPolygonal) {
              const x = Margin.X / 2
              maxX += x
              pos = `H ${maxX} V ${maxY}`
              maxX += x
              pos = `${pos} H ${maxX}`
            } else {
              const x = Margin.X
              maxX += x
              pos = `H ${maxX} V ${maxY}`
            }
            return `${acc} ${pos}`
          }, 'M 0 0')

          return path
        })
        .attr('stroke-dasharray', getDatumTotalLength)
        .attr('stroke-dashoffset', getDatumTotalLength)
        .each(setCommonUpdateProgress)
        .classed('focusing-linealAscendants', true)
    }

    // tree nodes
    // label
    svgg
      // 非表示アニメーション対象のnodesのラベルは非表示にしておく
      ?.filter(
        (d) => !(removeUris.length > 0 && removeUris.includes(d.data.uri))
      )
      .append('foreignObject')
      .attr('width', Margin.X)
      .attr('height', 40)
      .attr('x', -Margin.X / 2)
      .attr('class', 'top')
      .append('xhtml')
      .append('p')
      .text((d) => getPreferredLabel(d.data.uri, intl.locale, classes))
      .each((d, i, g) => {
        if (!d) return // prevention: unused parameter error(datum)
        const textSize = g[i]?.getBoundingClientRect()
        const foreignObject = g[i].parentElement?.parentElement
        foreignObject?.setAttribute('y', String(-22 - textSize.height))
      })
    // outer circle
    svgg
      ?.append('circle')
      .attr('class', 'outer')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 10)
      .classed('will-animate', shouldAnimate)
      .classed('will-remove', shouldRemove)
    // circle
    svgg
      ?.append('circle')
      .attr('class', (d) =>
        flattenSubClassOf.includes(d.data.uri) ? 'hidden-children' : 'leaf'
      )
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .classed('will-animate', shouldAnimate)
      .classed('will-remove', shouldRemove)
    // event handler
    svgg
      ?.selectAll<SVGElement, NodeType>(':not(path)')
      .on('click', handleClickTreeNode)

    // display toggle of child class
    // toggle
    const button = svgg
      ?.filter((d) => {
        if (!shouldShowDisplayButton(d, focusingNode)) {
          return false
        }
        // ツリーノード表示条件(「フォーカスノードの直系となる親ノードからみてN階層まで表示」)と整合性をとる
        const focusAscendant = this.findClosestFocusingAscendant(d)

        if (focusAscendant === undefined) {
          // `d`が多重継承クラスで別の系に存在する
          return false
        }

        const relDepth = calcDepthDiff(d, focusAscendant)
        return relDepth < DEFAULT_MAX_DEPTH
      })
      .append('g')
      .attr('class', (d) => (hiddenUris.includes(d.data.uri) ? 'off' : 'on'))
      .classed('will-remove', shouldRemove)
      .on('click', handleClickShowChildToggle)
    // toggle label
    const text1Y = 20
    const buttonText = `${intl.formatMessage({
      id: 'tree.child.class',
    })} ${intl.formatMessage({
      id: 'tree.display',
    })}`
    button?.append('text').attr('x', 0).attr('y', text1Y).text(buttonText)
    // toggle rect
    button
      ?.append('rect')
      .attr('x', -56 / 2)
      .attr('y', text1Y + 12 + 3)
      .attr('width', 56)
      .attr('height', 20)
      .attr('rx', 3)
      .attr('ry', 3)
    // toggle text
    const text2Y = text1Y + 12 + 3 + 20 / 2
    button
      ?.append('text')
      .attr('x', 0)
      .attr('y', text2Y)
      .text((d) => (hiddenUris.includes(d.data.uri) ? 'OFF' : 'ON'))
  }

  drawAnimationNodes() {
    const { appendUris, removeUris } = this
    if (appendUris.length > 0 || removeUris.length > 0) {
      const selection = this._svg?.selectAll<SVGElement, NodeType>(
        '.will-animate'
      )
      if (!selection) {
        return
      }

      this.startAnimation(selection).then(() => {
        d3.selectAll('.will-remove').attr('display', 'none')
      })
    }
  }

  startAnimation(selection: SVGChildElementType) {
    return new Promise((resolve) => {
      this.performAnimation(selection, resolve)
    })
  }

  performAnimation(
    selection: SVGChildElementType,
    completion: (value?: unknown) => void,
    start = window.performance.now()
  ) {
    const elapsed = window.performance.now() - start
    if (elapsed > ANIMATION_DURATION) {
      this.finishAnimation(selection, this.animationKeyMap.get(selection) ?? 0)
      this.animationKeyMap.delete(selection)
      completion()
    } else {
      const progress = elapsed / ANIMATION_DURATION
      this.animateNodes(selection, progress)
      const handler = this.performAnimation.bind(
        this,
        selection,
        completion,
        start
      )
      const animationReqId = window.requestAnimationFrame(handler)
      this.animationKeyMap.set(selection, animationReqId)
    }
  }

  finishAnimation(selection: SVGChildElementType, animationReqId: number) {
    window.cancelAnimationFrame(animationReqId)
    this.animateNodes(selection, 1)
  }

  animateNodes(selection: SVGChildElementType, progress: number) {
    selection.each((d, i, g) => {
      if (!d) return // prevention: unused parameter error(datum)

      if (this.animationFuncMap.has(g[i])) {
        const func = this.animationFuncMap.get(g[i])
        func?.(progress)
      }
    })
  }

  drawAnimationFocusingPath() {
    const focusingPath = this._svg?.selectAll<SVGElement, NodeType>(
      '.focusing-linealAscendants'
    )
    if (!focusingPath) {
      return
    }

    this.startAnimation(focusingPath)
  }
}

export default new TreeRepository()
