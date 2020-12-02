import { SignUpAction, SignUpActionNames } from '../actions/signup'

export const signUp = (): SignUpAction => ({
  type: SignUpActionNames.SIGN_UP,
})

export default signUp
