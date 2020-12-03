import {
  LoginAction,
  LogoutAction,
  AuthenticationActionNames,
} from '../actions/authentication'

export const login = (): LoginAction => ({
  type: AuthenticationActionNames.LOGIN,
})

export const logout = (): LogoutAction => ({
  type: AuthenticationActionNames.LOGOUT,
})

export default login
