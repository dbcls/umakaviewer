import { Action } from 'redux'

export enum UserActionNames {
  UPDATE = 'user/update',
  OPEN_DELETE_MODAL = 'user/open-delete-modal',
  CLOSE_DELETE_MODAL = 'user/close-delete-modal',
  DELETE = 'user/delete',
  SUBMIT_USER_ATTIBUTES = 'user/submit-user-attributes',
}

export enum UserRoleTypes {
  ADMIN = 1,
}

interface User {
  /* eslint-disable camelcase */
  display_name: string
  contact_uri: string
  roles: UserRoleTypes[]
  /* eslint-enable camelcase */
}

export type CurrentUser = User | null

export enum DeleteModalStates {
  CLOSE = 0,
  OPEN = 1,
}

export interface UserDeleteState {
  modal: DeleteModalStates
}

export interface UserUpdateAction extends Action {
  type: UserActionNames.UPDATE
  user: CurrentUser
}

export interface UserDeleteAction extends Action {
  type: UserActionNames.DELETE
}

export interface OpenDeleteModalAction extends Action {
  type: UserActionNames.OPEN_DELETE_MODAL
}

export interface CloseDeleteModalAction extends Action {
  type: UserActionNames.CLOSE_DELETE_MODAL
}

export type UserFormData = User

export interface SubmitUserAttributesAction extends Action {
  type: UserActionNames.SUBMIT_USER_ATTIBUTES
  user: UserFormData
}

export type UserActions =
  | UserUpdateAction
  | UserDeleteAction
  | OpenDeleteModalAction
  | CloseDeleteModalAction
  | SubmitUserAttributesAction
