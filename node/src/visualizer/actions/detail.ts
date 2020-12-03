import * as types from '../constants/ActionTypes'
import { ActionsUnion, createAction } from '../utils/action'
import { SearchAction } from './search'

export const DetailAction = {
  showParentClassesURI: (uri: string) =>
    createAction(types.SHOW_PARENT_CLASSES_URI, { uri }),
  focusCircle: (key: number | null, uri: string) =>
    createAction(types.FOCUS_CIRCLE_KEY, { key, uri }),
  focusPropertyClass: (key: number | null, uri: string | null = null) =>
    createAction(types.FOCUS_PROPERTY_CLASS, { key, uri }),
  showPropertyClass: (domain: string | null, range: string | null) =>
    createAction(types.SHOW_PROPERTY_CLASS, { domain, range }),
  showAllAssociatedClasses: () => createAction(types.SHOW_ALL_ASSOCIATED),
  showRightHandSideClasses: () => createAction(types.SHOW_RIGHT_HAND_SIDE),
  showLeftHandSideClasses: () => createAction(types.SHOW_LEFT_HAND_SIDE),
  showRelation: (relation: [string, string]) =>
    createAction(types.SHOW_RELATION, { relation }),
  showTree: () => createAction(types.SHOW_TREE),
  hideTree: () => createAction(types.HIDE_TREE),
  dummyDetailAction1: SearchAction.confirmCandidate,
}

export type DetailActionType = ActionsUnion<typeof DetailAction>
