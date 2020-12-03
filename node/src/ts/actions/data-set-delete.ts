import { Action } from 'redux'

import { DataSet } from './data-set-list'

export enum DataSetDeleteActionNames {
  OPEN_MODAL = 'data-set-delete/open-modal',
  CLOSE_MODAL = 'data-set-delete/close-modal',
  DELETE = 'data-set-delete/delete',
}

export enum DeleteModalStates {
  CLOSE = 0,
  OPEN = 1,
}

export interface DataSetDeleteState {
  modal: DeleteModalStates
  dataSet: DataSet | null
}

export interface OpenModalAction extends Action {
  type: DataSetDeleteActionNames.OPEN_MODAL
  dataSet: DataSet
}

export interface CloseModalAction extends Action {
  type: DataSetDeleteActionNames.CLOSE_MODAL
}

export interface DeleteAction extends Action {
  type: DataSetDeleteActionNames.DELETE
}

export type DataSetDeleteActions =
  | OpenModalAction
  | CloseModalAction
  | DeleteAction
