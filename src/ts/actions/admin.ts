import { Action } from 'redux'
import { Moment } from 'moment'

export enum AdminActionNames {
  GET_DATA_SET_LIST = 'admin/get-data-set-list',
  GET_DATA_SET_LIST_DONE = 'admin/get-data-set-list-done',
  UPDATE_DATA_SET_RESULT = 'admin/update-data-set-result',
  SELECT_DATA_SET = 'admin/select-data-set',
  DESELECT_DATA_SET = 'admin/deselect-data-set',
  DELETE_SELECTED_DATA_SETS = 'admin/delete-data-sets',
  DESELECT_ALL_DATA_SETS = 'admin/deselect-all-data-sets',
}

export interface DataSetParams {
  page?: number
}

export interface GetDataSetListAction extends Action {
  type: AdminActionNames.GET_DATA_SET_LIST
  params: DataSetParams
}

export interface DataSet {
  id: number
  title: string
  path: string
  /* eslint-disable camelcase */
  is_public: boolean
  upload_at: Moment
  user: {
    display_name: string
    contact_uri: string
  }
  /* eslint-enable camelcase */
}

interface GetDataSetListDoneAction extends Action {
  type: AdminActionNames.GET_DATA_SET_LIST_DONE
  dataSetList: DataSet[]
}

export interface DataSetResult {
  count: number
  previous: string | null
  next: string | null
}

interface UpdateDataSetResultAction extends Action {
  type: AdminActionNames.UPDATE_DATA_SET_RESULT
  result: DataSetResult
}

export interface SelectDataSetAction extends Action {
  type: AdminActionNames.SELECT_DATA_SET
  id: number
}

export interface DeselectDataSetAction extends Action {
  type: AdminActionNames.DESELECT_DATA_SET
  id: number
}

export interface DeleteSelectedDataSetsAction extends Action {
  type: AdminActionNames.DELETE_SELECTED_DATA_SETS
}

interface DeselectAllDataSetsAction extends Action {
  type: AdminActionNames.DESELECT_ALL_DATA_SETS
}

export type AdminActions =
  | GetDataSetListAction
  | GetDataSetListDoneAction
  | UpdateDataSetResultAction
  | SelectDataSetAction
  | DeselectDataSetAction
  | DeleteSelectedDataSetsAction
  | DeselectAllDataSetsAction
