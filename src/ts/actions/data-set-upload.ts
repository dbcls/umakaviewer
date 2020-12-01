import { Action } from 'redux'

export enum DataSetUploadActionNames {
  OPEN_MODAL = 'data-set-upload/open-modal',
  CLOSE_MODAL = 'data-set-upload/close-modal',
  UPLOAD = 'data-set-upload/upload',
  UPLOADING = 'data-set-upload/uploading',
  UPLOAD_DONE = 'data-set-upload/upload-done',
  UPLOAD_ERROR = 'data-set-upload/upload-error',
  CHANGE_TAB = 'data-set-upload/change-tab',
  CHANGE_ONTOLOGY_FILE = 'data-set-upload/change-ontology-file',
  CHANGE_SBM_FILE = 'data-set-upload/change-sbm-file',
  UPLOAD_FOR_UMAKAPARSER = 'data-set-upload/upload-for-umakaparser',
  ADD_TASK_ID = 'data-set-upload/add-task-id',
  REMOVE_TASK_ID = 'data-set-upload/remove-task-id',
}

export enum UploadModalStates {
  CLOSE = 0,
  OPEN = 1,
  UPLOADING = 2,
  UPLOAD_DONE = 3,
  UPLOAD_ERROR = 4,
}

export enum UploadModalTabs {
  JSON = 0,
  TTL = 1,
}

export enum UploadErrorType {
  CONVERT_ERROR = 'CONVERT_ERROR',
  OWL_ERROR = 'OWL_ERROR',
  SBM_ERROR = 'SBM_ERROR',
}

export interface DataSetUploadState {
  modal: UploadModalStates
  tab: UploadModalTabs
  ontologyFile: File | null
  sbmFile: File | null
  taskIds: string[]
  errorType: UploadErrorType | null
}

export interface OpenModalAction extends Action {
  type: DataSetUploadActionNames.OPEN_MODAL
}

export interface CloseModalAction extends Action {
  type: DataSetUploadActionNames.CLOSE_MODAL
}

export interface UploadAction extends Action {
  type: DataSetUploadActionNames.UPLOAD
  file: File
}

interface UploadingAction extends Action {
  type: DataSetUploadActionNames.UPLOADING
}

interface UploadDoneAction extends Action {
  type: DataSetUploadActionNames.UPLOAD_DONE
}

interface UploadErrorAction extends Action {
  type: DataSetUploadActionNames.UPLOAD_ERROR
  errorType: UploadErrorType
}

export interface ChangeTabAction extends Action {
  type: DataSetUploadActionNames.CHANGE_TAB
  tab: UploadModalTabs
}

export interface ChangeOntologyFileAction extends Action {
  type: DataSetUploadActionNames.CHANGE_ONTOLOGY_FILE
  ontologyFile: File
}

export interface ChangeSbmFileAction extends Action {
  type: DataSetUploadActionNames.CHANGE_SBM_FILE
  sbmFile: File
}

export interface UploadForUmakaparserAction extends Action {
  type: DataSetUploadActionNames.UPLOAD_FOR_UMAKAPARSER
}

interface AddTaskIdAction extends Action {
  type: DataSetUploadActionNames.ADD_TASK_ID
  taskId: string
}

interface RemoveTaskIdAction extends Action {
  type: DataSetUploadActionNames.REMOVE_TASK_ID
  taskId: string
}

export type DataSetUploadActions =
  | OpenModalAction
  | CloseModalAction
  | UploadAction
  | UploadingAction
  | UploadDoneAction
  | UploadErrorAction
  | ChangeTabAction
  | ChangeOntologyFileAction
  | ChangeSbmFileAction
  | UploadForUmakaparserAction
  | AddTaskIdAction
  | RemoveTaskIdAction
