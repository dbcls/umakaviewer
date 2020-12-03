import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as AdminActionCreators from '../../action-creators/admin'
import DataSetList from '../../components/admin/DataSetList'
import { ReduxAction, ReduxState } from '../../store'

export default connect(
  (state: ReduxState) => ({
    isLoading: state.isLoading,
    dataSetList: state.admin.dataSetList,
    result: state.admin.dataSetResult,
    selectedDataSets: state.admin.selectedDataSets,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(AdminActionCreators, dispatch),
  })
)(DataSetList)
