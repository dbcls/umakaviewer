import {
  DataSet,
  AdminActionNames,
  AdminActions,
  DataSetResult,
} from '../actions/admin'

const initialDataSets: DataSet[] = []

export default function dataSetListReducer(
  state: DataSet[] = initialDataSets,
  action: AdminActions
): DataSet[] {
  switch (action.type) {
    case AdminActionNames.GET_DATA_SET_LIST_DONE:
      return action.dataSetList
    default:
      return state
  }
}

const initialDataSetResult: DataSetResult = {
  count: 0,
  previous: null,
  next: null,
}

export function dataSetResultReducer(
  state: DataSetResult = initialDataSetResult,
  action: AdminActions
): DataSetResult {
  switch (action.type) {
    case AdminActionNames.UPDATE_DATA_SET_RESULT:
      return action.result
    default:
      return state
  }
}

const initialSelectedDataSets: number[] = []

export function selectedDataSetsReducer(
  state: number[] = initialSelectedDataSets,
  action: AdminActions
): number[] {
  switch (action.type) {
    case AdminActionNames.SELECT_DATA_SET:
      return [...state, action.id]
    case AdminActionNames.DESELECT_DATA_SET:
      return state.filter((id) => id !== action.id)
    case AdminActionNames.DESELECT_ALL_DATA_SETS:
      return initialSelectedDataSets
    default:
      return state
  }
}
