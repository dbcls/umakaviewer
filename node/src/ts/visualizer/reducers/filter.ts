import { FilterActionType } from '../actions/filter'
import * as types from '../constants/ActionTypes'

export interface FilterState {
  lowerLimitOfClassInstances: number
  showingConditions: boolean
}

const initialState: FilterState = {
  lowerLimitOfClassInstances: 0,
  showingConditions: true,
}

export default function legend(
  state = initialState,
  action: FilterActionType
): FilterState {
  switch (action.type) {
    case types.FILTER_CLASSES:
      return {
        ...state,
        lowerLimitOfClassInstances: action.payload.limit,
      }
    case types.SHOW_CONDITIONS:
      return {
        ...state,
        showingConditions: !state.showingConditions,
      }
    default:
      return state
  }
}
