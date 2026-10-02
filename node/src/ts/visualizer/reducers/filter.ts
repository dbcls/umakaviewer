import { FilterActionType } from '../actions/filter'
import * as types from '../constants/ActionTypes'

export interface FilterState {
  lowerLimitOfClassEntities: number
  showingConditions: boolean
  logScale: boolean
}

const initialState: FilterState = {
  lowerLimitOfClassEntities: 1,
  showingConditions: false,
  logScale: false,
}

export default function legend(
  state = initialState,
  action: FilterActionType
): FilterState {
  switch (action.type) {
    case types.FILTER_CLASSES:
      return {
        ...state,
        lowerLimitOfClassEntities: action.payload.limit,
      }
    case types.SHOW_CONDITIONS:
      return {
        ...state,
        showingConditions: !state.showingConditions,
      }
    case types.TOGGLE_LOG_SCALE:
      return {
        ...state,
        logScale: !state.logScale,
      }
    default:
      return state
  }
}
