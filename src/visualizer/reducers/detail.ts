import { DetailActionType } from '../actions/detail'
import * as types from '../constants/ActionTypes'

export interface DetailState {
  focusingURI: string | null
  focusingCircleKey: number | null
  showParentClassesURI: string | null
  propertyClass: {
    domain: string | null
    range: string | null
  }
  showRightHand: boolean
  showLeftHand: boolean
  showingRelation: [string, string] | null
  searchingURI: string | null
  showTree: boolean
  paneVisibility: string
}

const initialState: DetailState = {
  focusingURI: null,
  focusingCircleKey: null,
  showParentClassesURI: null,
  propertyClass: { domain: null, range: null },
  showRightHand: false,
  showLeftHand: false,
  showingRelation: null,
  searchingURI: null,
  showTree: false,
  paneVisibility: '',
}

export default function detail(
  state = initialState,
  action: DetailActionType
): DetailState {
  switch (action.type) {
    case types.SHOW_PARENT_CLASSES_URI:
      return {
        ...state,
        focusingURI: action.payload.uri,
        showParentClassesURI: action.payload.uri,
        propertyClass: { domain: null, range: null },
        searchingURI: null,
      }
    case types.FOCUS_CIRCLE_KEY:
      return {
        ...state,
        focusingCircleKey: action.payload.key,
        focusingURI: action.payload.uri,
        propertyClass: { domain: null, range: null },
        showRightHand: false,
        showLeftHand: false,
        showingRelation: null,
        searchingURI: null,
      }
    case types.FOCUS_PROPERTY_CLASS:
      return {
        ...state,
        focusingCircleKey: action.payload.key,
        focusingURI: action.payload.uri,
      }
    case types.SHOW_PROPERTY_CLASS:
      return {
        ...state,
        focusingURI: null,
        showParentClassesURI: null,
        showRightHand: false,
        showLeftHand: false,
        propertyClass: {
          domain: action.payload.domain,
          range: action.payload.range,
        },
        searchingURI: null,
        showTree: false,
      }
    case types.SHOW_ALL_ASSOCIATED:
      return {
        ...state,
        showRightHand: true,
        showLeftHand: true,
        showingRelation: null,
        showTree: false,
      }
    case types.SHOW_RIGHT_HAND_SIDE:
      if (!state.showingRelation) {
        const {
          focusingCircleKey,
          focusingURI,
          propertyClass: { domain, range },
          showRightHand,
          showLeftHand,
        } = state

        const newState: DetailState = {
          ...state,
          showRightHand: !showRightHand,
          showingRelation: null,
          showTree: false,
        }

        if (
          domain &&
          range &&
          focusingCircleKey &&
          focusingURI &&
          !showLeftHand &&
          showRightHand
        ) {
          // Property詳細でSubject or Objectの「関連するクラス」が全て閉じたら、クラスのフォーカスを外す
          return {
            ...newState,
            focusingCircleKey: null,
            focusingURI: null,
          }
        }
        return newState
      }
      return {
        ...state,
        showRightHand: true,
        showLeftHand: false,
        showingRelation: null,
      }
    case types.SHOW_LEFT_HAND_SIDE:
      if (!state.showingRelation) {
        const {
          focusingCircleKey,
          focusingURI,
          propertyClass: { domain, range },
          showRightHand,
          showLeftHand,
        } = state

        const newState: DetailState = {
          ...state,
          showLeftHand: !showLeftHand,
          showingRelation: null,
          showTree: false,
        }
        if (
          domain &&
          range &&
          focusingCircleKey &&
          focusingURI &&
          showLeftHand &&
          !showRightHand
        ) {
          // Property詳細でSubject or Objectの「関連するクラス」が全て閉じたら、クラスのフォーカスを外す
          return {
            ...newState,
            focusingCircleKey: null,
            focusingURI: null,
          }
        }
        return newState
      }
      return {
        ...state,
        showRightHand: false,
        showLeftHand: true,
        showingRelation: null,
      }
    case types.SHOW_RELATION:
      return {
        ...state,
        showingRelation: action.payload.relation,
      }
    case types.SHOW_TREE:
      return {
        ...state,
        showTree: true,
      }
    case types.HIDE_TREE:
      return {
        ...state,
        showTree: false,
      }
    case types.CONFIRM_CANDIDATE:
      return {
        ...state,
        focusingURI: null,
        searchingURI: action.payload.uri,
        showTree: false,
        propertyClass: {
          domain: null,
          range: null,
        },
      }
    default:
      return state
  }
}
