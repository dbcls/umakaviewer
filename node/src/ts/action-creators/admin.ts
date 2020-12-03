import {
  GetDataSetListAction,
  DataSetParams,
  AdminActionNames,
  SelectDataSetAction,
  DeselectDataSetAction,
  DeleteSelectedDataSetsAction,
} from '../actions/admin'

export const getDataSetList = (
  params: DataSetParams
): GetDataSetListAction => ({
  type: AdminActionNames.GET_DATA_SET_LIST,
  params,
})

export const selectDataSet = (id: number): SelectDataSetAction => ({
  type: AdminActionNames.SELECT_DATA_SET,
  id,
})

export const deselectDataSet = (id: number): DeselectDataSetAction => ({
  type: AdminActionNames.DESELECT_DATA_SET,
  id,
})

export const deleteSelectedDataSets = (): DeleteSelectedDataSetsAction => ({
  type: AdminActionNames.DELETE_SELECTED_DATA_SETS,
})

export default getDataSetList
