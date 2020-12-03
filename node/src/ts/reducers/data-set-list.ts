import {
  DataSet,
  EditedDataSet,
  PublicDataSet,
  PublicDataSetResult,
  PublicDisplayMethod,
  DataSetListActionNames,
  DataSetListActions,
} from '../actions/data-set-list'

const initialDataSets: DataSet[] = []

export default function dataSetListReducer(
  state: DataSet[] = initialDataSets,
  action: DataSetListActions
): DataSet[] {
  switch (action.type) {
    case DataSetListActionNames.GET_DATA_SET_LIST_DONE:
      return action.dataSetList
    case DataSetListActionNames.ADD_DATA_SET:
      return [...state, action.dataSet]
    case DataSetListActionNames.REMOVE_DATA_SET:
      return state.filter((d) => d.id !== action.dataSet.id)
    default:
      return state
  }
}

const initialEditedDataSets: EditedDataSet[] = []

export function editedDataSetsReducer(
  state: EditedDataSet[] = initialEditedDataSets,
  action: DataSetListActions
): EditedDataSet[] {
  switch (action.type) {
    case DataSetListActionNames.EDIT_DATA_SET: {
      const newState = state.filter((d) => d.id !== action.dataSet.id)
      newState.push(action.dataSet)
      return newState
    }
    case DataSetListActionNames.UPDATE_DONE:
      return initialEditedDataSets
    default:
      return state
  }
}

const initialPublicDataSets: PublicDataSet[] = []

export function publicDataSetListReducer(
  state: PublicDataSet[] = initialPublicDataSets,
  action: DataSetListActions
): PublicDataSet[] {
  switch (action.type) {
    case DataSetListActionNames.GET_PUBLIC_DATA_SET_LIST_DONE:
      return action.publicDataSetList
    default:
      return state
  }
}

const initialResult: PublicDataSetResult = {
  count: 0,
  previous: null,
  next: null,
}

export function publicDataSetResultReducer(
  state: PublicDataSetResult = initialResult,
  action: DataSetListActions
): PublicDataSetResult {
  switch (action.type) {
    case DataSetListActionNames.UPDATE_PUBLIC_DATA_SET_RESULT:
      return action.result
    default:
      return state
  }
}

const initialPublicDisplayMethod: PublicDisplayMethod = PublicDisplayMethod.GRID

export function publicDisplayMethodReducer(
  state: PublicDisplayMethod = initialPublicDisplayMethod,
  action: DataSetListActions
): PublicDisplayMethod {
  switch (action.type) {
    case DataSetListActionNames.CHANGE_PUBLIC_DISPLAY_METHOD:
      return action.method
    default:
      return state
  }
}
