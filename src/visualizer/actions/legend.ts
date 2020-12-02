import * as types from '../constants/ActionTypes'
import { ActionsUnion, createAction } from '../utils/action'

export const LegendAction = {
  showLegend: () => createAction(types.SHOW_LEGEND),
}

export type LegendActionType = ActionsUnion<typeof LegendAction>
