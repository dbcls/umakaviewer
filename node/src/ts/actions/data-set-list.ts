import { Action } from 'redux'
import { Moment } from 'moment'

import { FormAttributes } from '../constants'

export enum DataSetListActionNames {
  GET_DATA_SET_LIST = 'data-set-list/get-data-set-list',
  GET_DATA_SET_LIST_DONE = 'data-set-list/get-data-set-list-done',
  ADD_DATA_SET = 'data-set-list/add-data-set',
  REMOVE_DATA_SET = 'data-set-list/remove-data-set',
  EDIT_DATA_SET = 'data-set-list/edit-data-set',
  UPDATE = 'data-set-list/update',
  UPDATE_DONE = 'data-set-list/update-done',
  GET_PUBLIC_DATA_SET_LIST = 'data-set-list/get-public-data-set-list',
  GET_PUBLIC_DATA_SET_LIST_DONE = 'data-set-list/get-public-data-set-list-done',
  UPDATE_PUBLIC_DATA_SET_RESULT = 'data-set-list/update-public-data-set-result',
  CHANGE_PUBLIC_DISPLAY_METHOD = 'data-set-list/change-public-display-method',
}

export interface DataSet {
  id: number
  title: string
  path: string
  /* eslint-disable camelcase */
  upload_at: Moment
  is_public: boolean
  /* eslint-enable camelcase */
}

export interface EditedDataSet {
  id: number
  title: string
}

interface Tag {
  id: number
  name: string
}

export interface PublicDataSet {
  id: number
  title: string
  path: string
  /* eslint-disable camelcase */
  upload_at: Moment
  meta_data: {
    properties: number
    triples: number
    classes: number
    endpoint: string
    crawl_date: string
  }
  user: {
    display_name: string
    contact_uri: string
  }
  tags: Tag[]
  /* eslint-enable camelcase */
}

export interface PublicDataSetParams {
  search?: string
  sort: FormAttributes.PublicDataSetSearch.SortValue
  size?: number
  page?: number
}

export interface PublicDataSetResult {
  count: number
  previous: string | null
  next: string | null
}

export enum PublicDisplayMethod {
  GRID = 1,
  TABLE = 2,
}

export interface GetDataSetListAction extends Action {
  type: DataSetListActionNames.GET_DATA_SET_LIST
}

interface GetDataSetListDoneAction extends Action {
  type: DataSetListActionNames.GET_DATA_SET_LIST_DONE
  dataSetList: DataSet[]
}

interface AddDataSetAction extends Action {
  type: DataSetListActionNames.ADD_DATA_SET
  dataSet: DataSet
}

interface RemoveDataSetAction extends Action {
  type: DataSetListActionNames.REMOVE_DATA_SET
  dataSet: DataSet
}

export interface EditDataSetAction extends Action {
  type: DataSetListActionNames.EDIT_DATA_SET
  dataSet: EditedDataSet
}

export interface UpdateAction extends Action {
  type: DataSetListActionNames.UPDATE
}

interface UpdateDoneAction extends Action {
  type: DataSetListActionNames.UPDATE_DONE
}

export interface GetPublicDataSetListAction extends Action {
  type: DataSetListActionNames.GET_PUBLIC_DATA_SET_LIST
  params: PublicDataSetParams
}

interface GetPublicDataSetListDoneAction extends Action {
  type: DataSetListActionNames.GET_PUBLIC_DATA_SET_LIST_DONE
  publicDataSetList: PublicDataSet[]
}

interface UpdatePublicDataSetResultAction extends Action {
  type: DataSetListActionNames.UPDATE_PUBLIC_DATA_SET_RESULT
  result: PublicDataSetResult
}

export interface ChangePublicDisplayMethodAction extends Action {
  type: DataSetListActionNames.CHANGE_PUBLIC_DISPLAY_METHOD
  method: PublicDisplayMethod
}

export type DataSetListActions =
  | GetDataSetListAction
  | GetDataSetListDoneAction
  | AddDataSetAction
  | RemoveDataSetAction
  | EditDataSetAction
  | UpdateAction
  | UpdateDoneAction
  | GetPublicDataSetListAction
  | GetPublicDataSetListDoneAction
  | UpdatePublicDataSetResultAction
  | ChangePublicDisplayMethodAction
