import * as types from '../constants/ActionTypes'
import { ActionsUnion, createAction } from '../utils/action'

export const FilterAction = {
  filterClasses: (limit: number) =>
    createAction(types.FILTER_CLASSES, { limit }),
  showConditions: () => createAction(types.SHOW_CONDITIONS),
}

export type FilterActionType = ActionsUnion<typeof FilterAction>
