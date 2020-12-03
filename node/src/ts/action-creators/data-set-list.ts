import {
  GetDataSetListAction,
  EditedDataSet,
  EditDataSetAction,
  UpdateAction,
  GetPublicDataSetListAction,
  PublicDataSetParams,
  PublicDisplayMethod,
  ChangePublicDisplayMethodAction,
  DataSetListActionNames,
} from '../actions/data-set-list'

export const getDataSetList = (): GetDataSetListAction => ({
  type: DataSetListActionNames.GET_DATA_SET_LIST,
})

export const editDataSet = (dataSet: EditedDataSet): EditDataSetAction => ({
  type: DataSetListActionNames.EDIT_DATA_SET,
  dataSet,
})

export const update = (): UpdateAction => ({
  type: DataSetListActionNames.UPDATE,
})

export const getPublicDataSetList = (
  params: PublicDataSetParams
): GetPublicDataSetListAction => ({
  type: DataSetListActionNames.GET_PUBLIC_DATA_SET_LIST,
  params,
})

export const changePublicDisplayMethod = (
  method: PublicDisplayMethod
): ChangePublicDisplayMethodAction => ({
  type: DataSetListActionNames.CHANGE_PUBLIC_DISPLAY_METHOD,
  method,
})

export default getDataSetList
