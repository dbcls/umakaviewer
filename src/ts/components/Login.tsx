import * as React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { Url, FormAttributes } from '../constants'
import { LoginAction } from '../actions/authentication'
import {
  GetPublicDataSetListAction,
  PublicDataSet,
  PublicDataSetParams,
} from '../actions/data-set-list'
import LoginForm from './LoginForm'
import DataSetSummary from './DataSetSummary'
import Loading from './Loading'
import MultiLineMessage from './MultiLineMessage'

interface Props {
  isLoading: boolean
  dataSets: PublicDataSet[]
  actions: {
    login: () => LoginAction
  }
  dataSetListActions: {
    getPublicDataSetList: (
      params: PublicDataSetParams
    ) => GetPublicDataSetListAction
  }
}

export default class Login extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    const { dataSetListActions } = this.props
    dataSetListActions.getPublicDataSetList({
      sort: FormAttributes.PublicDataSetSearch.SortValue.UPLOAD_AT_DESC,
      size: 4,
    })
  }

  private onSubmit() {
    const { actions } = this.props
    actions.login()
  }

  private renderDataSets() {
    const { dataSets, isLoading } = this.props
    if (isLoading) {
      return <Loading />
    }

    if (dataSets.length === 0) {
      return null
    }

    return (
      <div className="dataset-summary__previews">
        <div className="dataset-summary__previews-header">
          <h2>
            <FormattedMessage id="login.headerLatestPublicData" />
          </h2>
          <Link to={Url.PUBLIC_DATA_SETS}>
            <FormattedMessage id="login.seeMore" />
          </Link>
        </div>
        <div className="dataset-summary__previews-contents">
          {dataSets.map((dataSet) => (
            <div
              key={`dataset-summary-${dataSet.id}`}
              className="dataset-summary__previews-content"
            >
              <DataSetSummary dataSet={dataSet} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  render() {
    return (
      <>
        <div className="aboutThisWebSite">
          <MultiLineMessage messageIds={['login.message1']} />
        </div>
        <LoginForm enableReinitialize onSubmit={this.onSubmit} />
        {this.renderDataSets()}
      </>
    )
  }
}
