import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as UserActionCreators from '../action-creators/user'
import UserDeleteModal from '../components/UserDeleteModal'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    userDelete: state.userDelete,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(UserActionCreators, dispatch),
  })
)(UserDeleteModal)
