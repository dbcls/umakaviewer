import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare, faCheckSquare } from '@fortawesome/free-regular-svg-icons'

import { Url } from '../../constants'
import {
  DataSet,
  GetDataSetListAction,
  DataSetParams,
  DataSetResult,
  SelectDataSetAction,
  DeselectDataSetAction,
  DeleteSelectedDataSetsAction,
} from '../../actions/admin'
import { history } from '../../store'
import Loading from '../Loading'
import Paginate from './Paginate'

interface Props {
  isLoading: boolean
  dataSetList: DataSet[]
  result: DataSetResult
  selectedDataSets: number[]
  actions: {
    getDataSetList: (params: DataSetParams) => GetDataSetListAction
    selectDataSet: (id: number) => SelectDataSetAction
    deselectDataSet: (id: number) => DeselectDataSetAction
    deleteSelectedDataSets: () => DeleteSelectedDataSetsAction
  }
  location: {
    pathname: string
    search: string
  }
}

export default class DataSetList extends React.Component<Props, {}> {
  private static convertSearchParamsToObject(params: URLSearchParams) {
    const page = params.get('page')
    return {
      page: page ? parseInt(page, 10) : 1,
    }
  }

  constructor(props: Props) {
    super(props)

    this.onChagenPage = this.onChagenPage.bind(this)
    this.onSelectDataSet = this.onSelectDataSet.bind(this)
    this.onDeselectDataSet = this.onDeselectDataSet.bind(this)
    this.onClickDelete = this.onClickDelete.bind(this)
  }

  componentDidMount() {
    const params = DataSetList.currentParams
    this.fetchDataSetList(params)
  }

  shouldComponentUpdate(nextProps: Props) {
    if (history.action !== 'POP') {
      return true
    }

    // ブラウザの戻る・進むで移動した場合
    const { location } = this.props
    const nextLocation = nextProps.location
    if (
      location.pathname === nextLocation.pathname &&
      location.search !== nextLocation.search
    ) {
      // 新しいQueryStringでデータを更新
      const params = DataSetList.convertSearchParamsToObject(
        new URLSearchParams(nextLocation.search)
      )
      this.fetchDataSetList(params)
    }
    return true
  }

  private onChagenPage(params: DataSetParams) {
    const { actions } = this.props
    actions.getDataSetList(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  private onSelectDataSet(id: number) {
    const { actions } = this.props
    actions.selectDataSet(id)
  }

  private onDeselectDataSet(id: number) {
    const { actions } = this.props
    actions.deselectDataSet(id)
  }

  private onClickDelete() {
    const { actions } = this.props
    actions.deleteSelectedDataSets()
  }

  private static get currentParams() {
    const params = new window.URL(window.location.href).searchParams
    return DataSetList.convertSearchParamsToObject(params)
  }

  private fetchDataSetList(params: DataSetParams) {
    const { actions } = this.props
    actions.getDataSetList(params)
  }

  render() {
    const { isLoading } = this.props
    if (isLoading) {
      return <Loading />
    }

    const { dataSetList, result, selectedDataSets } = this.props
    const { location } = window
    const viewerUriPrefix = `${location.protocol}//${location.host}${Url.VISUALIZER_PREFIX}/`
    const buttonClassName = selectedDataSets.length > 0 ? '' : 'disabled-button'
    return (
      <div className="admin_data_sets">
        <div className="admin_data_sets__actions">
          <button
            type="button"
            className={buttonClassName}
            onClick={this.onClickDelete}
            disabled={!!buttonClassName}
          >
            <FormattedMessage id="admin.dataSetList.buttonDelete" />
          </button>
        </div>
        <section className="admin_data_sets__table">
          <table>
            <tbody>
              <tr>
                <th />
                <th>
                  <FormattedMessage id="admin.dataSetList.tableTitle" />
                </th>
                <th>
                  <FormattedMessage id="admin.dataSetList.tableUri" />
                </th>
                <th>
                  <FormattedMessage id="admin.dataSetList.tableCreator" />
                </th>
                <th>
                  <FormattedMessage id="admin.dataSetList.tablePublicSetting" />
                </th>
                <th>
                  <FormattedMessage id="admin.dataSetList.tableDateUploaded" />
                </th>
              </tr>
              {dataSetList.map((d) => {
                const url = `${viewerUriPrefix}${d.path}`
                let checkBox
                let onClick
                if (selectedDataSets.find((id) => d.id === id)) {
                  checkBox = <FontAwesomeIcon size="lg" icon={faCheckSquare} />
                  onClick = () => this.onDeselectDataSet(d.id)
                } else {
                  checkBox = <FontAwesomeIcon size="lg" icon={faSquare} />
                  onClick = () => this.onSelectDataSet(d.id)
                }
                return (
                  <tr key={`admin-dataset-${d.id}-row`}>
                    <td role="presentation" onClick={onClick}>
                      {checkBox}
                    </td>
                    <td>{d.title}</td>
                    <td>
                      <Link
                        to={`${Url.VISUALIZER_PREFIX}/${d.path}`}
                        target="_blank"
                      >
                        {url}
                      </Link>
                    </td>
                    <td>{d.user.display_name}</td>
                    <td>
                      {d.is_public ? (
                        <FormattedMessage id="admin.dataSetList.publicSettingOn" />
                      ) : (
                        <FormattedMessage id="admin.dataSetList.publicSettingOff" />
                      )}
                    </td>
                    <td>
                      <FormattedMessage
                        id="admin.dataSetList.uploadDateFormat"
                        values={{
                          year: d.upload_at.format('YYYY'),
                          month: d.upload_at.format('MM'),
                          date: d.upload_at.format('DD'),
                          hour: d.upload_at.format('HH'),
                          minute: d.upload_at.format('mm'),
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
        <div className="admin_data_sets__paginate">
          <Paginate result={result} onChangePage={this.onChagenPage} />
        </div>
      </div>
    )
  }
}
