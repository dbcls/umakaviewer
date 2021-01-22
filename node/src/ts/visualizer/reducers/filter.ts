import { FilterActionType } from '../actions/filter'
import * as types from '../constants/ActionTypes'

export interface FilterState {
  lowerLimitOfClassInstances: number
}

const initialState: FilterState = {
  lowerLimitOfClassInstances: 0,
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
    default:
      return state
  }
}
