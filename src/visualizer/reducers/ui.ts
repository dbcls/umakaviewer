import { UiActionType } from '../actions/ui'
import * as types from '../constants/ActionTypes'

export interface UiState {
  svgWidth: number | null
  svgHeight: number | null
  circleDiameter: number | null
  propertyPaneVisibility: string
  detailPaneVisibility: string
}

const initialState: UiState = {
  svgWidth: null,
  svgHeight: null,
  circleDiameter: null,
  propertyPaneVisibility: '',
  detailPaneVisibility: '',
}

export default function ui(
  state = initialState,
  action: UiActionType
): UiState {
  switch (action.type) {
    case types.RESIZE: {
      return {
        ...state,
        svgWidth: action.payload.width,
        svgHeight: action.payload.height,
        circleDiameter:
          action.payload.width && action.payload.height
            ? Math.min(action.payload.width, action.payload.height)
            : null,
      }
    }
    case types.HIDE_DETAIL_PANE:
      return {
        ...state,
        detailPaneVisibility:
          state.detailPaneVisibility === 'hidden' ? 'visible' : 'hidden',
      }
    case types.HIDE_PROPERTY_PANE:
      return {
        ...state,
        propertyPaneVisibility:
          state.propertyPaneVisibility === 'hidden' ? 'visible' : 'hidden',
      }
    default:
      return state
  }
}
