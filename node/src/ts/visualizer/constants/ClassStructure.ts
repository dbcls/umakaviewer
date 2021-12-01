export const FOCUSING_PADDING = 50
export const SHOW_TEXT_MIN_CIRCLE_DIAMETER = 60
export const SHOW_TEXT_MAX_CIRCLE_DIAMETER = SHOW_TEXT_MIN_CIRCLE_DIAMETER * 6

export const HIGHLIGHTING_MIN_SIZE = 17

export namespace ClassNames {
  export namespace Normal {
    export const ROOT = 'root'
    export const NODE = 'node'
    export const LEAF = 'leaf'
    export const HIDDEN_CHILDREN = 'hidden-children'
    export const FOCUSING = 'focusing'
    export const SEARCHING = 'searching'
  }

  export namespace Domain {
    export const NODE = 'domain-node'
    export const LEAF = 'domain-leaf'
    export const HIDDEN_CHILDREN = 'domain-hidden-children'
    export const FOCUSING = 'domain-focusing'
  }

  export namespace Range {
    export const NODE = 'range-node'
    export const LEAF = 'range-leaf'
    export const HIDDEN_CHILDREN = 'range-hidden-children'
    export const FOCUSING = 'range-focusing'
  }

  export namespace DomainRange {
    export const NODE = 'domain-range-node'
    export const LEAF = 'domain-range-leaf'
    export const HIDDEN_CHILDREN = 'domain-range-hidden-children'
    export const FOCUSING = 'domain-range-focusing'
  }
}
