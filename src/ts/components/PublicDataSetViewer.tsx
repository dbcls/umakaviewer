import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faList,
  faTh,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons'

import {
  FormAttributes,
  Url,
  PUBLIC_DATA_SET_SIZE_PER_PAGE,
  Color,
} from '../constants'
import {
  GetPublicDataSetListAction,
  ChangePublicDisplayMethodAction,
  PublicDataSet,
  PublicDataSetParams,
  PublicDataSetResult,
  PublicDisplayMethod,
} from '../actions/data-set-list'
import DataSetSummary from './DataSetSummary'
import Paginate from './Paginate'
import Loading from './Loading'
import { history } from '../store'

interface Props {
  isLoading: boolean
  dataSets: PublicDataSet[]
  result: PublicDataSetResult
  displayMethod: PublicDisplayMethod
  actions: {
    getPublicDataSetList: (
      params: PublicDataSetParams
    ) => GetPublicDataSetListAction
    changePublicDisplayMethod: (
      method: PublicDisplayMethod
    ) => ChangePublicDisplayMethodAction
  }
  location: {
    pathname: string
    search: string
  }
}

interface SearchParams {
  sort: number
  search: string
  page: number
}

export default class PublicDataSetViewer extends React.Component<Props, {}> {
  private static convertSearchParamsToObject(params: URLSearchParams) {
    const sort = params.get('sort')
    const page = params.get('page')
    const search = params.get('search')
    return {
      sort: sort
        ? parseInt(sort, 10)
        : FormAttributes.PublicDataSetSearch.SortValue.CLASSES_DESC,
      page: page ? parseInt(page, 10) : 1,
      search: search || '',
    }
  }

  private isCompositionStarting: boolean

  private searchRef: React.RefObject<HTMLInputElement>

  private sortRef: React.RefObject<HTMLSelectElement>

  constructor(props: Props) {
    super(props)

    this.isCompositionStarting = false
    this.searchRef = React.createRef<HTMLInputElement>()
    this.sortRef = React.createRef<HTMLSelectElement>()

    this.onCompositionStart = this.onCompositionStart.bind(this)
    this.onCompositionEnd = this.onCompositionEnd.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChangeSort = this.onChangeSort.bind(this)
    this.onChagenPage = this.onChagenPage.bind(this)
    this.onChangeDisplayMethod = this.onChangeDisplayMethod.bind(this)
  }

  componentDidMount() {
    // 現在のQueryStringから公開DataSetの条件を取得して使用
    const params = PublicDataSetViewer.currentParams
    this.fetchDataSetsAndUpdateForm(params)
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
      const params = PublicDataSetViewer.convertSearchParamsToObject(
        new URLSearchParams(nextLocation.search)
      )
      this.fetchDataSetsAndUpdateForm(params)
    }
    return true
  }

  private onCompositionStart() {
    this.isCompositionStarting = true
  }

  private onCompositionEnd() {
    this.isCompositionStarting = false
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (this.isCompositionStarting === false && event.key === 'Enter') {
      this.getNewPublicDataSets()
    }
  }

  private onChangeSort() {
    this.getNewPublicDataSets()
  }

  private onChagenPage(params: PublicDataSetParams) {
    const { actions } = this.props
    actions.getPublicDataSetList(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  private onChangeDisplayMethod(method: PublicDisplayMethod) {
    const { actions } = this.props
    actions.changePublicDisplayMethod(method)
  }

  private static get currentParams() {
    const params = new window.URL(window.location.href).searchParams
    return PublicDataSetViewer.convertSearchParamsToObject(params)
  }

  private get searchValue() {
    return this.searchRef.current ? this.searchRef.current.value : ''
  }

  private get sortValue() {
    return this.sortRef.current
      ? parseInt(this.sortRef.current.value, 10)
      : FormAttributes.PublicDataSetSearch.SortValue.CLASSES_DESC
  }

  private getNewPublicDataSets() {
    const search = this.searchValue
    const sort = this.sortValue
    const { actions } = this.props
    actions.getPublicDataSetList({ search, sort })
    const queryString = `sort=${sort}&search=${encodeURI(search)}&page=1`
    history.push({ pathname: Url.PUBLIC_DATA_SETS, search: queryString })
  }

  private fetchDataSetsAndUpdateForm(params: SearchParams) {
    const { actions } = this.props
    actions.getPublicDataSetList(params)
    // input, selectに値を設定
    if (this.searchRef.current) {
      this.searchRef.current.value = params.search
    }
    if (this.sortRef.current) {
      this.sortRef.current.value = params.sort.toString()
    }
  }

  private renderCounter() {
    const { result } = this.props
    const params = PublicDataSetViewer.currentParams
    const firstCount = result.count
      ? (params.page - 1) * PUBLIC_DATA_SET_SIZE_PER_PAGE + 1
      : 0
    let lastCount
    if (result.count !== 0) {
      if (result.next) {
        lastCount = firstCount + PUBLIC_DATA_SET_SIZE_PER_PAGE - 1
      } else {
        // 最後のページのとき残り何個が表示されるのか
        const remainder = result.count % PUBLIC_DATA_SET_SIZE_PER_PAGE
        if (remainder === 0) {
          lastCount = firstCount + PUBLIC_DATA_SET_SIZE_PER_PAGE - 1
        } else {
          lastCount = firstCount + remainder - 1
        }
      }
    } else {
      lastCount = 0
    }

    return (
      <div className="public_viewer__counter">
        <p>
          <FormattedMessage
            id="publicDataSetViewer.counter"
            values={{ total: result.count, firstCount, lastCount }}
          />
        </p>
      </div>
    )
  }

  private renderDisplayMethod() {
    const { displayMethod } = this.props
    return (
      <div className="public_viewer__display_method_container">
        <div
          className="public_viewer__display_method"
          onClick={() => this.onChangeDisplayMethod(PublicDisplayMethod.GRID)}
          role="presentation"
        >
          <FontAwesomeIcon
            size="2x"
            icon={faTh}
            color={displayMethod === PublicDisplayMethod.GRID ? Color.MAIN : ''}
          />
          <span>
            <FormattedMessage id="publicDataSetViewer.displayMethodGrid" />
          </span>
        </div>
        <div
          className="public_viewer__display_method"
          onClick={() => this.onChangeDisplayMethod(PublicDisplayMethod.TABLE)}
          role="presentation"
        >
          <FontAwesomeIcon
            size="2x"
            icon={faList}
            color={
              displayMethod === PublicDisplayMethod.TABLE ? Color.MAIN : ''
            }
          />
          <span>
            <FormattedMessage id="publicDataSetViewer.displayMethodTable" />
          </span>
        </div>
      </div>
    )
  }

  private renderSortSelector() {
    return (
      <select onChange={this.onChangeSort} ref={this.sortRef}>
        {FormAttributes.PublicDataSetSearch.SORT_TYPES.map(({ value, id }) => (
          <FormattedMessage id={id} key={id}>
            {(msg: string) => (
              <option key={`public-dataset-sort-${value}`} value={value}>
                {msg}
              </option>
            )}
          </FormattedMessage>
        ))}
      </select>
    )
  }

  private renderContents() {
    const { isLoading, displayMethod } = this.props
    if (isLoading) {
      return <Loading />
    }

    switch (displayMethod) {
      case PublicDisplayMethod.GRID:
        return this.renderGrid()
      case PublicDisplayMethod.TABLE:
        return this.renderTable()
      default:
        return null
    }
  }

  private renderGrid() {
    const { dataSets } = this.props
    return (
      <div className="public_viewer__content_container">
        {dataSets.map((d) => (
          <div
            key={`dataset-summary-${d.id}`}
            className="public_viewer__content"
          >
            <DataSetSummary dataSet={d} />
          </div>
        ))}
      </div>
    )
  }

  private renderTable() {
    const { dataSets } = this.props
    const { location } = window
    const viewerUriPrefix = `${location.protocol}//${location.host}${Url.VISUALIZER_PREFIX}/`
    return (
      <section className="public_viewer__table">
        <table>
          <tbody>
            <tr>
              <th>
                <FormattedMessage id="publicDataSetViewer.tableTitle" />
              </th>
              <th>
                <FormattedMessage id="publicDataSetViewer.tableUri" />
              </th>
              <th>
                <FormattedMessage id="publicDataSetViewer.tableTag" />
              </th>
              <th>
                <FormattedMessage id="publicDataSetViewer.tableCreator" />
              </th>
              <th>
                <FormattedMessage id="publicDataSetViewer.tableDateUploaded" />
              </th>
            </tr>
            {dataSets.map((d) => {
              const urls = [
                {
                  label: (
                    <FormattedMessage id="publicDataSetViewer.tableViewerUriLabel" />
                  ),
                  url: `${Url.VISUALIZER_PREFIX}/${d.path}`,
                  urlText: `${viewerUriPrefix}${d.path}`,
                },
                {
                  label: (
                    <FormattedMessage id="publicDataSetViewer.tableEndpointUriLabel" />
                  ),
                  url: d.meta_data.endpoint,
                  urlText: d.meta_data.endpoint,
                },
              ]
              return (
                <tr key={`public-dataset-${d.id}-row`}>
                  <td>{d.title}</td>
                  <td>
                    {urls.map(({ label, url, urlText }) => (
                      <div
                        className="public_viewer__table_url"
                        key={`public-dataset-url-${label}`}
                      >
                        <span>{label}</span>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {urlText}
                        </a>
                      </div>
                    ))}
                  </td>
                  <td>
                    <div className="public_viewer__table_tags">
                      {d.tags.map((tag) => (
                        <div
                          key={`dataset-tag-${tag.id}`}
                          className="public_viewer__table_tag"
                        >
                          <span>{tag.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="public_viewer__creator_name">
                      {d.user.display_name}
                    </span>
                    {d.user.contact_uri ? (
                      <a
                        href={d.user.contact_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                      </a>
                    ) : null}
                  </td>
                  <td>
                    <FormattedMessage
                      id="publicDataSetViewer.uploadDateFormat"
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
    )
  }

  render() {
    const { result } = this.props
    return (
      <div className="public_viewer">
        <div className="public_viewer__title">
          <h2>
            <FormattedMessage id="publicDataSetViewer.h2" />
          </h2>
        </div>
        <div className="public_viewer__search">
          <FormattedMessage id="publicDataSetViewer.inputSearchPlaceholder">
            {(placeholder: string) => (
              <input
                type="text"
                placeholder={placeholder}
                onCompositionStart={this.onCompositionStart}
                onCompositionEnd={this.onCompositionEnd}
                onKeyDown={this.onKeyDown}
                ref={this.searchRef}
              />
            )}
          </FormattedMessage>
        </div>
        <div className="public_viewer__counter_sort">
          {this.renderCounter()}
          <div className="public_viewer__sort">
            {this.renderDisplayMethod()}
            {this.renderSortSelector()}
          </div>
        </div>
        {this.renderContents()}
        <div className="public_viewer__paginate">
          <Paginate result={result} onChangePage={this.onChagenPage} />
        </div>
      </div>
    )
  }
}
