import * as types from '../constants/ActionTypes'
import { ActionsUnion, createAction } from '../utils/action'

export const FilterAction = {
  filterClasses: (limit: number) =>
    createAction(types.FILTER_CLASSES, { limit }),
  showConditions: () => createAction(types.SHOW_CONDITIONS),
  toggleLogScale: () => createAction(types.TOGGLE_LOG_SCALE),
}

export type FilterActionType = ActionsUnion<typeof FilterAction>
