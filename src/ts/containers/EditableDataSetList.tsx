import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as DataSetListActionCreators from '../action-creators/data-set-list'
import * as DataSetDeleteActionCreators from '../action-creators/data-set-delete'
import EditableDataSetList from '../components/EditableDataSetList'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    dataSetList: state.dataSetList,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(DataSetListActionCreators, dispatch),
    deleteModalActions: bindActionCreators(
      DataSetDeleteActionCreators,
      dispatch
    ),
  })
)(EditableDataSetList)
