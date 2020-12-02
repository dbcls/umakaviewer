import * as types from '../constants/ActionTypes'
import { ActionsUnion, createAction } from '../utils/action'
import { DetailAction } from './detail'
import { SearchAction } from './search'

export const PropertyAction = {
  showProperty: (index: number) => createAction(types.SHOW_PROPERTY, { index }),
  closeProperty: (index: number) =>
    createAction(types.CLOSE_PROPERTY, { index }),
  selectPropertyClass: (index1: number | null, index2: number | null) =>
    createAction(types.SELECT_PROERTY_CLASS, { index1, index2 }),
  dummyPropertyAction: DetailAction.showParentClassesURI,
  dummyPropertyAction2: DetailAction.focusCircle,
  dummyPropertyAction3: SearchAction.confirmCandidate,
}

export type PropertyActionType = ActionsUnion<typeof PropertyAction>
