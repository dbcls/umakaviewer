import {
  UserDeleteAction,
  UserActionNames,
  OpenDeleteModalAction,
  CloseDeleteModalAction,
  UserFormData,
  SubmitUserAttributesAction,
} from '../actions/user'

export const deleteUser = (): UserDeleteAction => ({
  type: UserActionNames.DELETE,
})

export const openDeleteModal = (): OpenDeleteModalAction => ({
  type: UserActionNames.OPEN_DELETE_MODAL,
})

export const closeDeleteModal = (): CloseDeleteModalAction => ({
  type: UserActionNames.CLOSE_DELETE_MODAL,
})

export const submitUserAttributes = (
  user: UserFormData
): SubmitUserAttributesAction => ({
  type: UserActionNames.SUBMIT_USER_ATTIBUTES,
  user,
})

export default deleteUser
