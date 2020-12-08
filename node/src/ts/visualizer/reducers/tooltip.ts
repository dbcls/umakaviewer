import { TooltipActionType } from '../actions/tooltip'
import * as types from '../constants/ActionTypes'

export interface TooltipState {
  uri: string | null
  pos: ClientRect | null
}

const initialState: TooltipState = {
  uri: null,
  pos: null,
}

export default function tooltip(
  state = initialState,
  action: TooltipActionType
): TooltipState {
  switch (action.type) {
    case types.SHOW_TOOLTIP:
      return {
        ...state,
        uri: action.payload.uri,
        pos: action.payload.pos,
      }
    case types.HIDE_TOOLTIP:
      return {
        uri: null,
        pos: null,
      }
    default:
      return state
  }
}
