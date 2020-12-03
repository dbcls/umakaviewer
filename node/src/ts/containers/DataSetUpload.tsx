import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as DataSetUploadActionCreators from '../action-creators/data-set-upload'
import DataSetUpload from '../components/DataSetUpload'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    dataSetUpload: state.dataSetUpload,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(DataSetUploadActionCreators, dispatch),
  })
)(DataSetUpload)
