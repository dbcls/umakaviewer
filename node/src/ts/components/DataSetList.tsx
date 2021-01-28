import * as React from 'react'
import { Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FormattedMessage } from 'react-intl'

import { Url } from '../constants'
import { GetDataSetListAction, UpdateAction } from '../actions/data-set-list'
import { OpenModalAction } from '../actions/data-set-upload'
import DataSetUpload from '../containers/DataSetUpload'
import DataSetDelete from '../containers/DataSetDelete'
import EditableDataSetList from '../containers/EditableDataSetList'
import Loading from './Loading'
import MultiLineMessage from './MultiLineMessage'

interface Props {
  isLoading: boolean
  didEdit: boolean
  actions: {
    getDataSetList: () => GetDataSetListAction
    update: () => UpdateAction
  }
  uploadModalActions: {
    openModal: () => OpenModalAction
  }
}

export default class DataSetList extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onClickUpload = this.onClickUpload.bind(this)
    this.onClickUpdate = this.onClickUpdate.bind(this)
  }

  componentDidMount() {
    const { actions } = this.props
    actions.getDataSetList()
  }

  private onClickUpload(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { uploadModalActions } = this.props
    uploadModalActions.openModal()
  }

  private onClickUpdate(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { actions } = this.props
    actions.update()
  }

  private renderDataSetList() {
    const { isLoading } = this.props
    if (isLoading) {
      return <Loading />
    }
    return (
      <section className="layout-datalist">
        <table>
          <tbody>
            <tr>
              <th>
                <FormattedMessage id="dataSetList.tableTitle" />
              </th>
              <th>
                <FormattedMessage id="dataSetList.tableUrl" />
              </th>
              <th>
                <FormattedMessage id="dataSetList.tableDateTime" />
              </th>
              <th>
                <FormattedMessage id="dataSetList.tablePublicSetting" />
              </th>
              <th>
                <FormattedMessage id="dataSetList.tableDelete" />
              </th>
            </tr>
            <EditableDataSetList />
          </tbody>
        </table>
      </section>
    )
  }

  render() {
    return (
      <>
        <DataSetUpload />
        <DataSetDelete />
        <section className="upload-btn">
          <Link
            onClick={this.onClickUpload}
            to={Url.TOP}
            className="upload-btn__btn"
          >
            <FormattedMessage id="dataSetList.buttonUpload" />
          </Link>
        </section>
        <div className="howToUpload">
          <MultiLineMessage
            messageIds={['dataSetList.message1', 'dataSetList.message2']}
            values={[
              {
                sbm: (...chunks: any) => (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={Url.External.DOC_SBM}
                  >
                    {chunks}
                  </a>
                ),
                umakaparser: (...chunks: any) => (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={Url.External.UMAKAPARSER_GITHUB}
                  >
                    {chunks}
                  </a>
                ),
              },
              undefined,
            ]}
          />
        </div>
        {this.renderDataSetList()}
        <ToastContainer />
      </>
    )
  }
}
