import { PropertyActionType } from '../actions/property'
import * as types from '../constants/ActionTypes'

export interface PropertyState {
  openPropertyIndexes: boolean[]
  showPropertyClassIndex: [number | null, number | null]
  referenceProperties: {
    resource: string
    properties: { [key: string]: string }
  }
  paneVisibility: string
}

const initialState: PropertyState = {
  openPropertyIndexes: [],
  showPropertyClassIndex: [null, null],
  referenceProperties: {
    resource: '',
    properties: {},
  },
  paneVisibility: '', // アニメーションのクラス名。初期状態にアニメーションを付けない。
}

export default function property(
  state = initialState,
  action: PropertyActionType
): PropertyState {
  switch (action.type) {
    case types.SHOW_PROPERTY: {
      const newState = { ...state }
      newState.openPropertyIndexes[action.payload.index] = true
      return newState
    }
    case types.CLOSE_PROPERTY: {
      const newState = { ...state }
      newState.openPropertyIndexes[action.payload.index] = false
      return newState
    }
    case types.SELECT_PROERTY_CLASS:
      return {
        ...state,
        showPropertyClassIndex: [action.payload.index1, action.payload.index2],
      }
    case types.SHOW_PARENT_CLASSES_URI:
    case types.FOCUS_CIRCLE_KEY:
      return {
        ...state,
        showPropertyClassIndex: [null, null],
      }
    case types.CONFIRM_CANDIDATE:
      return {
        ...state,
        showPropertyClassIndex: [null, null],
      }
    default:
      return state
  }
}
