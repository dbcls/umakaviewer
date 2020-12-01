import {
  CurrentUser,
  UserActionNames,
  UserActions,
  UserDeleteState,
  DeleteModalStates,
} from '../actions/user'

const initialUser: CurrentUser = null

export default function userReducer(
  state: CurrentUser = initialUser,
  action: UserActions
): CurrentUser {
  switch (action.type) {
    case UserActionNames.UPDATE:
      return action.user
    default:
      return state
  }
}

const initialDeleteState: UserDeleteState = {
  modal: DeleteModalStates.CLOSE,
}

export function userDeleteReducer(
  state: UserDeleteState = initialDeleteState,
  action: UserActions
): UserDeleteState {
  switch (action.type) {
    case UserActionNames.OPEN_DELETE_MODAL:
      return { modal: DeleteModalStates.OPEN }
    case UserActionNames.CLOSE_DELETE_MODAL:
      return { modal: DeleteModalStates.CLOSE }
    default:
      return state
  }
}
