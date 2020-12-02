import * as types from '../constants/ActionTypes'
import { ActionsUnion, createAction } from '../utils/action'

export const TooltipAction = {
  show: (uri: string, pos: ClientRect) =>
    createAction(types.SHOW_TOOLTIP, { uri, pos }),
  hide: () => createAction(types.HIDE_TOOLTIP),
}

export type TooltipActionType = ActionsUnion<typeof TooltipAction>
