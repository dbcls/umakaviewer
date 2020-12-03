import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as UserActionCreators from '../action-creators/user'
import UserDelete from '../components/UserDelete'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (state: ReduxState) => ({}),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(UserActionCreators, dispatch),
  })
)(UserDelete)
