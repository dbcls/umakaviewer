import {
  DeleteModalStates,
  DataSetDeleteState,
  DataSetDeleteActionNames,
  DataSetDeleteActions,
} from '../actions/data-set-delete'

const initialDeleteState: DataSetDeleteState = {
  modal: DeleteModalStates.CLOSE,
  dataSet: null,
}

export default function dataSetDeleteReducer(
  state: DataSetDeleteState = initialDeleteState,
  action: DataSetDeleteActions
): DataSetDeleteState {
  switch (action.type) {
    case DataSetDeleteActionNames.OPEN_MODAL:
      return { modal: DeleteModalStates.OPEN, dataSet: action.dataSet }
    case DataSetDeleteActionNames.CLOSE_MODAL:
      return initialDeleteState
    default:
      return state
  }
}
