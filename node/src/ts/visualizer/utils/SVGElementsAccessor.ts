import { NodeType, SVGGElementType, Point } from './GraphRepository'

export default class SVGElementsAccessor {
  ctx: SVGGElementType

  constructor(ctx: SVGGElementType) {
    this.ctx = ctx
  }

  get circles() {
    return this.ctx
      .select('g#circles')
      .selectAll<SVGCircleElement, NodeType>('circle')
  }

  get paths() {
    const lines = this.ctx.select('g#lines')
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

  get linesNodes() {
    const nodes = this.ctx?.select('g#lines-nodes')
    return {
      same: nodes?.selectAll<SVGPathElement, NodeType>('circle.same-line'),
      rightHand: nodes?.selectAll<SVGPathElement, NodeType>(
        'circle.right-hand-line'
      ),
      leftHand: nodes?.selectAll<SVGPathElement, NodeType>(
        'circle.left-hand-line'
      ),
      both: nodes?.selectAll<SVGPathElement, NodeType>('circle.both-line'),
      self: nodes?.selectAll<SVGPathElement, NodeType>('circle.self-line'),
    }
  }

  get texts() {
    const texts = this.ctx.selectAll('g#texts > g')
    return texts?.selectAll<SVGTextElement, NodeType>('text')
  }

  get gtexts() {
    const texts = this.ctx.select('g#texts')
    return texts?.selectAll<SVGGElement, NodeType>('g')
  }

  get popups() {
    return this.ctx.selectAll<HTMLElement, Point>('.popup')
  }
}
