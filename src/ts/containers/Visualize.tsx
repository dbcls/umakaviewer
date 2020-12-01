import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'

import * as VisualizeActionCreators from '../action-creators/visualize'
import Visualize from '../components/Visualize'
import { ReduxAction, ReduxState } from '../store'

export default connect(
  (state: ReduxState) => ({
    dataSet: state.visualizedDataSet,
  }),
  (dispatch: Dispatch<ReduxAction>) => ({
    actions: bindActionCreators(VisualizeActionCreators, dispatch),
  })
)(Visualize)
