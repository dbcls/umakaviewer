import { Action } from 'redux'

export enum SignUpActionNames {
  SIGN_UP = 'sign-up',
}

export interface SignUpAction extends Action {
  type: SignUpActionNames.SIGN_UP
}

export type SignUpActions = SignUpAction
