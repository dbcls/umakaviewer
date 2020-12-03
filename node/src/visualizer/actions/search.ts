import * as types from '../constants/ActionTypes'
import { Classes } from '../types/class'
import { ActionsUnion, createAction } from '../utils/action'

export const SearchAction = {
  updateQuery: (query: string, classes: Classes) =>
    createAction(types.UPDATE_QUERY, { query, classes }),
  prevCandidate: () => createAction(types.PREV_CANDIDATE),
  nextCandidate: () => createAction(types.NEXT_CANDIDATE),
  selectCandidate: (index: number) =>
    createAction(types.SELECT_CANDIDATE, { index }),
  confirmCandidate: (uri: string | null = null) =>
    createAction(types.CONFIRM_CANDIDATE, { uri }),
  hideCandidate: () =>
    createAction(types.UPDATE_QUERY, { query: '', classes: {} }),
}

export type SearchActionType = ActionsUnion<typeof SearchAction>
