import {
  GetDataSetSettingAction,
  UpdatedDataSetSetting,
  UpdateDataSetSettingAction,
  DataSetSettingActionNames,
} from '../actions/data-set-setting'

export const getDataSetSetting = (id: number): GetDataSetSettingAction => ({
  type: DataSetSettingActionNames.GET_DATA_SET,
  id,
})

export const updateDataSetSetting = (
  id: number,
  dataSetSetting: UpdatedDataSetSetting
): UpdateDataSetSettingAction => ({
  type: DataSetSettingActionNames.UPDATE,
  id,
  dataSetSetting,
})

export default getDataSetSetting
