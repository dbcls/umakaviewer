import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as AuthenticationActionCreators from '../action-creators/authentication'
import * as DataSetListActionCreators from '../action-creators/data-set-list'
import Login from '../components/Login'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    dataSets: state.publicDataSetList,
    isLoading: state.isLoading,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(AuthenticationActionCreators, dispatch),
    dataSetListActions: bindActionCreators(DataSetListActionCreators, dispatch),
  })
)(Login)
