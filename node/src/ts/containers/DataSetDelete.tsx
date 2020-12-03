import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as DataSetDeleteActionCreators from '../action-creators/data-set-delete'
import DataSetDelete from '../components/DataSetDelete'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    dataSetDelete: state.dataSetDelete,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(DataSetDeleteActionCreators, dispatch),
  })
)(DataSetDelete)
