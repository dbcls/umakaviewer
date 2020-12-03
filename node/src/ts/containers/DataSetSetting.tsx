import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as DataSetSettingActionCreators from '../action-creators/data-set-setting'
import DataSetSetting from '../components/DataSetSetting'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    dataSetSetting: state.dataSetSetting,
    isLoading: state.isLoading,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(DataSetSettingActionCreators, dispatch),
  })
)(DataSetSetting)
