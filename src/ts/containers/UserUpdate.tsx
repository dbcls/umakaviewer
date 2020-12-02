import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as UserActionCreators from '../action-creators/user'
import UserUpdate from '../components/UserUpdate'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({ user: state.currentUser }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(UserActionCreators, dispatch),
  })
)(UserUpdate)
