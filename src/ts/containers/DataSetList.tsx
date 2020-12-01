import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as DataSetListActionCreators from '../action-creators/data-set-list'
import * as DataSetUploadActionCreators from '../action-creators/data-set-upload'
import DataSetList from '../components/DataSetList'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    isLoading: state.isLoading,
    didEdit: state.editedDataSets.length > 0,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(DataSetListActionCreators, dispatch),
    uploadModalActions: bindActionCreators(
      DataSetUploadActionCreators,
      dispatch
    ),
  })
)(DataSetList)
