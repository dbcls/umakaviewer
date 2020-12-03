import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

import { Url } from '../constants'
import { PublicDataSet } from '../actions/data-set-list'

interface Props {
  dataSet: PublicDataSet
}

export default class DataSetSummary extends React.Component<Props, {}> {
  private renderLink() {
    const { dataSet } = this.props
    const { location } = window
    const viewerUri = `${location.protocol}//${location.host}${Url.VISUALIZER_PREFIX}/${dataSet.path}`
    const urls = [
      {
        label: <FormattedMessage id="dataSetSummary.uriViewerLabel" />,
        url: `${Url.VISUALIZER_PREFIX}/${dataSet.path}`,
        urlText: viewerUri,
      },
      {
        label: <FormattedMessage id="dataSetSummary.uriEndpointLabel" />,
        url: dataSet.meta_data.endpoint,
        urlText: dataSet.meta_data.endpoint,
      },
    ]
    return (
      <div className="dataset-summary__urlContainer">
        {urls.map(({ label, url, urlText }, index) => {
          const key = `dataset-summary-url-${label}-${index}`
          return (
            <div key={key} className="dataset-summary__url">
              <span className="dataset-summary__label">{label}</span>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {urlText}
              </a>
            </div>
          )
        })}
      </div>
    )
  }

  private renderMetaData() {
    const { dataSet } = this.props
    const metaData = [
      {
        key: <FormattedMessage id="dataSetSummary.metaNomberOfClass" />,
        value: dataSet.meta_data.classes,
      },
      {
        key: <FormattedMessage id="dataSetSummary.metaNomberOfProperty" />,
        value: dataSet.meta_data.properties,
      },
    ]
    return (
      <div className="dataset-summary__metaContainer">
        {metaData.map(({ key, value }, index) => {
          const divKey = `meta-data-${key}-${index}`
          return (
            <div key={divKey} className="dataset-summary__meta">
              <span className="dataset-summary__label">{key}</span>
              <span>{value}</span>
            </div>
          )
        })}
      </div>
    )
  }

  private renderTag() {
    const { dataSet } = this.props
    return (
      <div className="dataset-summary__tagContainer">
        <span className="dataset-summary__label">
          <FormattedMessage id="dataSetSummary.tagLabel" />
        </span>
        <div className="dataset-summary__tags">
          {dataSet.tags.map((tag) => (
            <div
              key={`dataset-summary-tag-${tag.id}`}
              className="dataset-summary__tag"
            >
              <span>{tag.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  private renderCreator() {
    const { dataSet } = this.props
    return (
      <div className="dataset-summary__creatorContainer">
        <span className="dataset-summary__label">
          <FormattedMessage id="dataSetSummary.creatorLabel" />
        </span>
        <div className="">
          <span className="dataset-summary__creator">
            {dataSet.user.display_name}
          </span>
          {dataSet.user.contact_uri ? (
            <a
              href={dataSet.user.contact_uri}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </a>
          ) : null}
        </div>
      </div>
    )
  }

  private renderUploadAt() {
    const {
      dataSet: { upload_at }, // eslint-disable-line camelcase
    } = this.props
    return (
      <div className="dataset-summary__uploadDateContainer">
        <span className="dataset-summary__label">
          <FormattedMessage id="dataSetSummary.uploadDateLabel" />
        </span>
        <span>
          <FormattedMessage
            id="dataSetSummary.uploadDateFormat"
            values={{
              year: upload_at.format('YYYY'),
              month: upload_at.format('MM'),
              date: upload_at.format('DD'),
              hour: upload_at.format('HH'),
              minute: upload_at.format('mm'),
            }}
          />
        </span>
      </div>
    )
  }

  render() {
    const { dataSet } = this.props
    return (
      <div className="dataset-summary__wrapper">
        <div className="dataset-summary__container">
          <h3 className="dataset-summary__title">{dataSet.title}</h3>
          {this.renderLink()}
          {this.renderMetaData()}
          {this.renderTag()}
          {this.renderCreator()}
          {this.renderUploadAt()}
        </div>
      </div>
    )
  }
}
