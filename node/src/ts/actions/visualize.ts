import { Action } from 'redux'
import { Content } from '../visualizer'

export enum VisualizeActionNames {
  GET_DATA_SET = 'visualize/get-data-set',
  GET_DATA_SET_DONE = 'visualize/get-data-set-done',
}

interface DataSet {
  id: number
  title: string
  content: Content
}

export type VisualizedDataSet = DataSet | null

export interface GetDataSetAction extends Action {
  type: VisualizeActionNames.GET_DATA_SET
  path: string
}

export interface GetDataSetDoneAction extends Action {
  type: VisualizeActionNames.GET_DATA_SET_DONE
  visualizedDataSet: VisualizedDataSet
}

export type VisualizeActions = GetDataSetAction | GetDataSetDoneAction
