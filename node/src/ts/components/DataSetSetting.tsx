import * as React from 'react'

import {
  CurrentDataSetSetting,
  GetDataSetSettingAction,
  UpdatedDataSetSetting,
  UpdateDataSetSettingAction,
} from '../actions/data-set-setting'
import DataSetSettingForm from './DataSetSettingForm'
import Loading from './Loading'

interface Props {
  match: {
    params: { id: number }
  }
  isLoading: boolean
  dataSetSetting: CurrentDataSetSetting
  actions: {
    getDataSetSetting: (id: number) => GetDataSetSettingAction
    updateDataSetSetting: (
      id: number,
      dataSetSetting: UpdatedDataSetSetting
    ) => UpdateDataSetSettingAction
  }
}

export default class DataSetSetting extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    const { actions } = this.props
    actions.getDataSetSetting = actions.getDataSetSetting.bind(this)
    actions.updateDataSetSetting = actions.updateDataSetSetting.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    const { actions, match } = this.props
    actions.getDataSetSetting(match.params.id)
  }

  private onSubmit(data: UpdatedDataSetSetting) {
    const { actions, match } = this.props
    actions.updateDataSetSetting(match.params.id, data)
  }

  render() {
    const { dataSetSetting, isLoading } = this.props
    if (isLoading) {
      return <Loading />
    }

    const initialValues = {
      is_public: dataSetSetting ? dataSetSetting.is_public : false,
      comma_separated_tag_name: dataSetSetting
        ? dataSetSetting.tags.map((d) => d.name).join(',')
        : '',
    }
    return (
      <DataSetSettingForm
        initialValues={initialValues}
        onSubmit={this.onSubmit}
        enableReinitialize
      />
    )
  }
}
