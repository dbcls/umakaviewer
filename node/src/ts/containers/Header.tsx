import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as AuthenticationActionCreators from '../action-creators/authentication'
import Header from '../components/Header'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    currentUser: state.currentUser,
    dataSetSetting: state.dataSetSetting,
    umakaparserTasksCount: state.dataSetUpload.taskIds.length,
    dataSet: state.visualizedDataSet,
    isAuthenticated: !!state.currentUser,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(AuthenticationActionCreators, dispatch),
  })
)(Header)
