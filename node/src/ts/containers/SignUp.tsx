import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as SignUpActionCreators from '../action-creators/signup'
import SignUp from '../components/SignUp'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (state: ReduxState) => ({}),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(SignUpActionCreators, dispatch),
  })
)(SignUp)
