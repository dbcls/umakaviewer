import {
  UploadModalStates,
  UploadModalTabs,
  DataSetUploadState,
  DataSetUploadActionNames,
  DataSetUploadActions,
} from '../actions/data-set-upload'

const initialUploadState: DataSetUploadState = {
  modal: UploadModalStates.CLOSE,
  tab: UploadModalTabs.JSON,
  ontologyFile: null,
  sbmFile: null,
  taskIds: [],
  errorType: null,
}

export default function dataSetUploadReducer(
  state: DataSetUploadState = initialUploadState,
  action: DataSetUploadActions
): DataSetUploadState {
  switch (action.type) {
    case DataSetUploadActionNames.OPEN_MODAL:
      return { ...state, modal: UploadModalStates.OPEN }
    case DataSetUploadActionNames.CLOSE_MODAL:
      return { ...initialUploadState, taskIds: state.taskIds }
    case DataSetUploadActionNames.UPLOADING:
      return { ...state, modal: UploadModalStates.UPLOADING }
    case DataSetUploadActionNames.UPLOAD_DONE:
      return { ...state, modal: UploadModalStates.UPLOAD_DONE }
    case DataSetUploadActionNames.UPLOAD_ERROR:
      return {
        ...state,
        modal: UploadModalStates.UPLOAD_ERROR,
        errorType: action.errorType,
      }
    case DataSetUploadActionNames.CHANGE_TAB:
      return { ...state, tab: action.tab }
    case DataSetUploadActionNames.CHANGE_ONTOLOGY_FILE:
      return { ...state, ontologyFile: action.ontologyFile }
    case DataSetUploadActionNames.CHANGE_SBM_FILE:
      return { ...state, sbmFile: action.sbmFile }
    case DataSetUploadActionNames.ADD_TASK_ID: {
      return { ...state, taskIds: [...state.taskIds, action.taskId] }
    }
    case DataSetUploadActionNames.REMOVE_TASK_ID:
      return {
        ...state,
        taskIds: state.taskIds.filter((taskId) => taskId !== action.taskId),
      }
    default:
      return state
  }
}
