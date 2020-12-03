import { Action } from 'redux'

export enum AuthenticationActionNames {
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export interface LoginAction extends Action {
  type: AuthenticationActionNames.LOGIN
}

export interface LogoutAction extends Action {
  type: AuthenticationActionNames.LOGOUT
}

export type AuthenticationActions = LoginAction | LogoutAction
