import { combineReducers } from 'redux'

import { DataSet, DataSetResult } from '../actions/admin'
import dataSetListReducer, {
  dataSetResultReducer,
  selectedDataSetsReducer,
} from '../reducers/admin'

export const adminReducer = combineReducers({
  dataSetList: dataSetListReducer,
  dataSetResult: dataSetResultReducer,
  selectedDataSets: selectedDataSetsReducer,
})

export type AdminState = {
  dataSetList: DataSet[]
  dataSetResult: DataSetResult
  selectedDataSets: number[]
}
