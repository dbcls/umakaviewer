import * as types from '../constants/ActionTypes'
import { ActionsUnion, createAction } from '../utils/action'

export const UiAction = {
  notifyResize: () => {
    const svg = document
      .getElementById('classes-structure')
      ?.getBoundingClientRect()
    const [width, height] = svg ? [svg.width, svg.height] : [null, null]
    return createAction(types.RESIZE, { width, height })
  },
  hidePropertyPane: () => createAction(types.HIDE_PROPERTY_PANE),
  hideDetailPane: () => createAction(types.HIDE_DETAIL_PANE),
}

export type UiActionType = ActionsUnion<typeof UiAction>
