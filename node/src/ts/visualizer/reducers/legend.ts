import { LegendActionType } from '../actions/legend'
import * as types from '../constants/ActionTypes'

export interface LegendState {
  showingLegend: boolean
}

const initialState: LegendState = {
  showingLegend: false,
}

export default function legend(
  state = initialState,
  action: LegendActionType
): LegendState {
  switch (action.type) {
    case types.SHOW_LEGEND: {
      return { ...state, showingLegend: !state.showingLegend }
    }
    default:
      return state
  }
}
