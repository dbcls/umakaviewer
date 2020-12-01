import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as DataSetListActionCreators from '../action-creators/data-set-list'
import PublicDataSetViewer from '../components/PublicDataSetViewer'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    isLoading: state.isLoading,
    dataSets: state.publicDataSetList,
    result: state.publicDataSetResult,
    displayMethod: state.publicDisplayMethod,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(DataSetListActionCreators, dispatch),
  })
)(PublicDataSetViewer)
