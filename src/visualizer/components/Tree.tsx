import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import _ from 'lodash'
import { Classes } from '../types/class'
import { NodeType } from '../utils/GraphRepository'
import {
  calcDepthDiff,
  flattenChildren,
  getNodeUris,
  getRootNode,
  hasParent,
} from '../utils/node'
import TreeRepository, {
  getTranslateY,
  shouldShowDisplayButton,
} from '../utils/TreeRepository'
import { RootState } from '../reducers'
import { getPreferredLabel } from '../utils'
import { DetailAction } from '../actions/detail'
import { DEFAULT_MAX_DEPTH, Depth, Margin } from '../constants/Tree'

type TreeProps = {
  nodes: NodeType[]
  classes: Classes
}

export type TreeState = {
  maxDepth: number
  hiddenUris: string[]
}

const selector = ({
  detail: { focusingURI, focusingCircleKey },
}: RootState) => ({ focusingURI, focusingCircleKey })
export const Tree: React.FC<TreeProps> = (props) => {
  const { nodes, classes } = props
  const [state, setState] = useState<TreeState>({
    maxDepth: DEFAULT_MAX_DEPTH,
    hiddenUris: [],
  })
  const { focusingURI, focusingCircleKey } = useSelector(selector)
  const dispatch = useDispatch()
  const intl = useIntl()

  const svgRef = useRef<SVGSVGElement>(null)
  const svgDivRef = useRef<HTMLDivElement>(null)

  const updateTreeState = React.useCallback(
    (depth: number) => {
      const { focusingNode } = TreeRepository
      const { hiddenUris, maxDepth } = state

      const newMaxDepth = depth > maxDepth ? depth : depth - 1
      const toggleNodes = nodes
        .filter((node) => shouldShowDisplayButton(node, focusingNode))
        .concat([focusingNode]) // 一括トグルに対してはフォーカスノード自身も含める

      let newHiddenUris: string[] = []
      if (newMaxDepth < maxDepth) {
        const diffUris = getNodeUris(
          toggleNodes.filter(
            (node) => calcDepthDiff(node, focusingNode) >= newMaxDepth
          )
        )
        newHiddenUris = _.union(hiddenUris, diffUris)
      } else {
        const diffUris = getNodeUris(
          toggleNodes.filter(
            (node) => calcDepthDiff(node, focusingNode) < newMaxDepth
          )
        )
        newHiddenUris = hiddenUris.filter((uri) => !diffUris.includes(uri))
      }

      setState({
        ...state,
        maxDepth: newMaxDepth,
        hiddenUris: newHiddenUris,
      })
    },
    [nodes, state]
  )

  const updateHiddenUris = React.useCallback(
    (node: NodeType) => {
      const { hiddenUris } = state

      const newHiddenUris: string[] = hiddenUris.includes(node.data.uri)
        ? hiddenUris.filter((uri) => uri !== node.data.uri)
        : hiddenUris.concat([node.data.uri])

      setState({
        ...state,
        hiddenUris: newHiddenUris,
      })
    },
    [state]
  )

  const scrollToFocusingClass = React.useCallback(() => {
    // フォーカス中のクラスまでスクロールする
    if (svgDivRef.current) {
      const { current: div } = svgDivRef
      const divRect = div.getBoundingClientRect()

      const { focusingNode, focusingGElement } = TreeRepository
      const focusingGRect = focusingGElement?.getBoundingClientRect()

      if (divRect && focusingGRect) {
        div.scrollTop = getTranslateY(focusingNode) - divRect.height / 2
        div.scrollLeft += focusingGRect.left - divRect.left - divRect.width / 2
      }
    }
  }, [])

  const handleHideTree = React.useCallback(() => {
    dispatch(DetailAction.hideTree())
  }, [dispatch])

  const handleClickReturnToFocusingClass = React.useCallback(() => {
    scrollToFocusingClass()
  }, [scrollToFocusingClass])

  const handleClickShowRelationToggle = React.useCallback(
    (e?: React.MouseEvent<SVGGElement, MouseEvent>, depth?: number) => {
      if (!e || !depth) return

      updateTreeState(depth)
    },
    [updateTreeState]
  )

  const handleClickTreeNode = React.useCallback(
    (e?: React.MouseEvent<SVGGElement, MouseEvent>, d?: NodeType) => {
      if (!e || !d) return

      dispatch(DetailAction.focusCircle(d.data.key, d.data.uri))
    },
    [dispatch]
  )

  const handleClickShowChildToggle = React.useCallback(
    (e?: React.MouseEvent<SVGGElement, MouseEvent>, d?: NodeType) => {
      if (!e || !d) return

      e.stopPropagation()
      updateHiddenUris(d)
    },
    [updateHiddenUris]
  )

  const getTreeNodes = React.useCallback((nextState: TreeState = state) => {
    const { maxDepth, hiddenUris } = nextState

    const {
      focusingNode,
      multipleInheritanceNodes,
      multipleInheritanceUris,
    } = TreeRepository

    const rootNode = getRootNode(focusingNode)
    const treeNodes = flattenChildren(rootNode)
      .filter((node) => {
        if (node.depth === 1) {
          return true
        }

        const focusingAscendant = TreeRepository.findClosestFocusingAscendant(
          node
        )
        if (focusingAscendant === undefined) {
          // `node`が多重継承クラスで別の系に存在する
          return false
        }

        const relDepth = calcDepthDiff(node, focusingAscendant)
        return relDepth <= DEFAULT_MAX_DEPTH
      })
      .filter((node) => {
        if (calcDepthDiff(node, focusingNode) > maxDepth) {
          if (
            node.parent &&
            shouldShowDisplayButton(node.parent, focusingNode) &&
            !state.hiddenUris.includes(node.parent.data.uri)
          ) {
            // 階層レベルでDisplay OFFだがノード単位でONなら表示
            return true
          }
          return false
        }
        return true
      })
      .filter(
        (node) => node.parent && !hiddenUris.includes(node.parent.data.uri)
      )

    const treeNodeUris = getNodeUris(treeNodes)
    const isTreeNode = (node: NodeType) => treeNodeUris.includes(node.data.uri)

    let maxY = 0
    const configureTreeY = (node: NodeType, childIdx: number) => {
      if (childIdx > 0) {
        maxY += Margin.Y
      }

      const d = node
      d.data.oldTreeY = d.data.treeY
      d.data.treeY = maxY
      d.data.delta = undefined
      if (node === focusingNode && multipleInheritanceUris.length > 0) {
        maxY += (Margin.Y / 2) * multipleInheritanceUris.length
      }
    }
    // 各nodeのY座標をセットする副作用を与える関数
    const configureNodesY = (node: NodeType, childIdx = 0) => {
      if (!isTreeNode(node)) return

      const d = node
      configureTreeY(node, childIdx)
      if (d.children !== undefined) {
        // modify order of children
        d.children = _.sortBy(d.children, [
          (nd) => nd.children === undefined,
          (nd) => (nd.children === undefined ? 0 : nd.children.length * -1),
        ])
        d.children.forEach((child, i) => configureNodesY(child, i))
      }
    }

    configureNodesY(rootNode)
    return treeNodes.concat(
      multipleInheritanceNodes.map<NodeType>((superClass, i) => ({
        ...superClass,
        depth: focusingNode.parent?.depth || 0,
        data: {
          ...superClass.data,
          isMultipleInheritanceSource: true,
          oldTreeY: superClass.data.treeY,
          treeY: (focusingNode.data?.treeY || 0) + (Margin.Y / 2) * (i + 1),
        },
      }))
    )
  }, [])

  const updateDiffs = React.useCallback(
    (oldTreeNodes: NodeType[], newTreeNodes: NodeType[]) => {
      const { multipleInheritanceUris } = TreeRepository

      const oldUris = getNodeUris(oldTreeNodes)
      const newUris = getNodeUris(newTreeNodes)

      TreeRepository.appendUris = _.difference(newUris, oldUris).concat(
        multipleInheritanceUris
      )
      TreeRepository.removeUris = _.difference(oldUris, newUris)
      TreeRepository.moveUris = _.intersection(oldUris, newUris).filter(
        (uri) => {
          const target = newTreeNodes.find((node) => node.data.uri === uri)
          if (target) {
            const {
              data: { oldTreeY, treeY },
            } = target
            return oldTreeY && oldTreeY !== treeY
          }
          return false
        }
      )
    },
    []
  )

  const draw = React.useCallback(
    (
      oldTreeNodes: NodeType[],
      treeNodes: NodeType[],
      nextState: TreeState = state
    ) => {
      TreeRepository.removeChildGElement()

      // draw class information
      const { focusingNode } = TreeRepository
      const depths: number[] = [] // class information data
      if (hasParent(focusingNode)) {
        depths.push(Depth.PARENT)
      }
      if (focusingNode.children) {
        depths.push(Depth.CHILD)
      }
      if (_.some(focusingNode.children, 'children')) {
        depths.push(Depth.GRANDCHILD)
      }

      TreeRepository.drawClassInfos(
        intl,
        nextState,
        depths,
        handleClickShowRelationToggle
      )

      // draw tree nodes
      const { linealAscendantUris, removeUris } = TreeRepository
      let drawableTreeNodes = treeNodes
      if (removeUris.length > 0) {
        // 非表示対象nodesをアニメーション初期状態として追加しておく
        const removeTargets = oldTreeNodes.filter((d) =>
          removeUris.includes(d.data.uri)
        )
        drawableTreeNodes = drawableTreeNodes.concat(removeTargets)
      }

      // focusing, parentのを前面にする(pathがnormalのstrokeに潰されないように)
      drawableTreeNodes = _.sortBy(drawableTreeNodes, [
        (node) => linealAscendantUris.includes(node.data.uri),
        (node) => node === focusingNode,
      ])

      TreeRepository.drawNodes(
        intl,
        nextState,
        drawableTreeNodes,
        handleClickTreeNode,
        handleClickShowChildToggle
      )

      // execute animation function
      TreeRepository.drawAnimationNodes()
      TreeRepository.drawAnimationFocusingPath()
    },
    [
      handleClickShowChildToggle,
      handleClickShowRelationToggle,
      handleClickTreeNode,
      intl,
    ]
  )

  const getGSize = React.useCallback(
    (element: ChildNode, prop: 'top' | 'right' | 'left' | 'bottom'): number => {
      const children = _.filter(element.childNodes, 'tagName') // IEはsvg要素のchildrenを返さない...
      if (children.length === 0) {
        // Firefoxのgタグ.getBoundingClientRect().widthは0を返す...
        const rect = element.firstChild?.parentElement?.getBoundingClientRect()
        return rect ? rect[prop] : 0
      }
      return _.max(_.map(children, (child) => getGSize(child, prop))) || 0
    },
    []
  )

  const adjustSvgSize = React.useCallback(() => {
    const div = svgDivRef.current
    const svg = svgRef.current

    if (!div || !svg) {
      return
    }

    const width = getGSize(svg, 'right') + div.scrollLeft
    const height = getGSize(svg, 'bottom') + div.scrollTop

    TreeRepository.resizeSvg(width, height)
  }, [getGSize])

  React.useEffect(() => {
    TreeRepository.updateNodes(props.nodes)
    TreeRepository.setClasses(props.classes)
  }, [props.nodes, props.classes])

  const treeNodesRef = React.useRef<NodeType[]>([])
  const oldTreeNodesRef = React.useRef<NodeType[]>([])
  React.useEffect(() => {
    TreeRepository.setFocusingNodes(focusingCircleKey || 0)

    TreeRepository.setSvg()
    TreeRepository.setFilters()

    treeNodesRef.current = getTreeNodes()

    const { current: treeNodes } = treeNodesRef
    updateDiffs([], treeNodes)
    draw([], treeNodes)
    adjustSvgSize()

    // 即時実行では反映されない場合があるのでdelayを設けている
    setTimeout(() => scrollToFocusingClass(), 10)

    oldTreeNodesRef.current = treeNodesRef.current
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const prevStateRef = React.useRef(state)
  const prevDetailStateRef = React.useRef({ focusingURI })
  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (mounted.current) {
      if (focusingCircleKey === 0 || focusingURI === '') {
        dispatch(DetailAction.hideTree())
        return
      }

      const { focusingURI: prevFocusingURI } = prevDetailStateRef.current

      let nextState: TreeState = state
      if (focusingURI !== prevFocusingURI) {
        TreeRepository.setFocusingNodes(focusingCircleKey || 0)

        const { hiddenUris } = state
        const newHiddenUris = hiddenUris.filter((uri) => uri !== focusingURI)
        const newMaxDepth = DEFAULT_MAX_DEPTH

        nextState = {
          ...nextState,
          hiddenUris: newHiddenUris,
          maxDepth: newMaxDepth,
        }
        setState(nextState)
      }

      const prevState = prevStateRef.current
      if (
        focusingURI !== prevFocusingURI ||
        nextState.hiddenUris !== prevState.hiddenUris ||
        nextState.maxDepth !== prevState.maxDepth
      ) {
        oldTreeNodesRef.current = treeNodesRef.current
        treeNodesRef.current = getTreeNodes(nextState)

        const oldTreeNodes = oldTreeNodesRef.current
        const treeNodes = treeNodesRef.current
        const oldRootTreeNode = oldTreeNodes.find((node) => node.depth === 1)
        const rootTreeNode = treeNodes.find((node) => node.depth === 1)

        if (oldRootTreeNode?.data.uri === rootTreeNode?.data.uri) {
          updateDiffs(oldTreeNodes, treeNodes)
          draw(oldTreeNodes, treeNodes, nextState)
        } else {
          draw([], treeNodes, nextState)
        }
        adjustSvgSize()
      }

      if (focusingURI !== prevFocusingURI) {
        setTimeout(() => scrollToFocusingClass(), 10)
      }

      prevStateRef.current = nextState
      prevDetailStateRef.current = { focusingURI }
    } else {
      mounted.current = true
    }
  }, [
    adjustSvgSize,
    draw,
    focusingCircleKey,
    focusingURI,
    getTreeNodes,
    state,
    updateDiffs,
  ])

  const svgElement = React.useMemo(
    () => (
      <div ref={svgDivRef}>
        <svg ref={svgRef} id="tree-components" />
      </div>
    ),
    []
  )

  const preferredLabel = React.useMemo(
    () => getPreferredLabel(focusingURI || '', classes, intl.locale),
    [classes, focusingURI, intl.locale]
  )
  const baseElement = React.useMemo(
    () => (
      <figure>
        <header>
          <h2>
            {intl.formatMessage(
              { id: 'tree.hierarchical.relationship.of' },
              { target: preferredLabel }
            )}
          </h2>
          <button type="button" onClick={handleHideTree}>
            ×
          </button>
        </header>
        {svgElement}
        <footer>
          <button
            type="button"
            className="focused"
            onClick={handleClickReturnToFocusingClass}
          >
            <div className="focused-icon" />
            {intl.formatMessage({ id: 'tree.return.to.selected.class' })}
          </button>
          <div className="selected">
            <div className="legend" />
            {intl.formatMessage({ id: 'tree.class.currently.selected' })}
          </div>
          <div className="parent">
            <div className="legend" />
            {intl.formatMessage({
              id: 'tree.parent.class.of.the.currently.selected.class',
            })}
          </div>
        </footer>
      </figure>
    ),
    [
      handleClickReturnToFocusingClass,
      handleHideTree,
      intl,
      preferredLabel,
      svgElement,
    ]
  )

  return baseElement
}
