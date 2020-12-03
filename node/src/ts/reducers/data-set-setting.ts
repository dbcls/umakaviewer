import {
  CurrentDataSetSetting,
  DataSetSettingActionNames,
  DataSetSettingActions,
} from '../actions/data-set-setting'

const initialDataSetSetting: CurrentDataSetSetting = null

export default function dataSetSettingReducer(
  state: CurrentDataSetSetting = initialDataSetSetting,
  action: DataSetSettingActions
): CurrentDataSetSetting {
  switch (action.type) {
    case DataSetSettingActionNames.GET_DATA_SET_DONE:
      return action.dataSetSetting
    default:
      return state
  }
}
