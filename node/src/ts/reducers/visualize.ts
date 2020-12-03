import {
  VisualizedDataSet,
  VisualizeActionNames,
  VisualizeActions,
} from '../actions/visualize'

const initialDataSet: VisualizedDataSet = null

export default function visualizedDataSetReducer(
  state: VisualizedDataSet = initialDataSet,
  action: VisualizeActions
): VisualizedDataSet {
  switch (action.type) {
    case VisualizeActionNames.GET_DATA_SET_DONE:
      return action.visualizedDataSet
    default:
      return state
  }
}
