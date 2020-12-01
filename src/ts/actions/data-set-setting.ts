import { Action } from 'redux'

export enum DataSetSettingActionNames {
  GET_DATA_SET = 'data-set-setting/get-data-set',
  GET_DATA_SET_DONE = 'data-set-setting/get-data-set-done',
  UPDATE = 'data-set-setting/update',
}

interface Tag {
  id: number
  name: string
}

interface DataSetSetting {
  id: number
  title: string
  /* eslint-disable camelcase */
  is_public: boolean
  /* eslint-enable camelcase */
  tags: Tag[]
}

export type CurrentDataSetSetting = DataSetSetting | null

export interface UpdatedDataSetSetting {
  /* eslint-disable camelcase */
  is_public: boolean
  comma_separated_tag_name: string
  /* eslint-enable camelcase */
}

export interface GetDataSetSettingAction {
  type: DataSetSettingActionNames.GET_DATA_SET
  id: number
}

interface GetDataSetSettingDoneAction extends Action {
  type: DataSetSettingActionNames.GET_DATA_SET_DONE
  dataSetSetting: DataSetSetting
}

export interface UpdateDataSetSettingAction extends Action {
  type: DataSetSettingActionNames.UPDATE
  id: number
  dataSetSetting: UpdatedDataSetSetting
}

export type DataSetSettingActions =
  | GetDataSetSettingAction
  | GetDataSetSettingDoneAction
  | UpdateDataSetSettingAction
