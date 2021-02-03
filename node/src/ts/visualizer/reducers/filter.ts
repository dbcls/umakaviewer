import { FilterActionType } from '../actions/filter'
import * as types from '../constants/ActionTypes'

export interface FilterState {
  lowerLimitOfClassEntities: number
  showingConditions: boolean
}

const initialState: FilterState = {
  lowerLimitOfClassEntities: 0,
  showingConditions: false,
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
    default:
      return state
  }
}
