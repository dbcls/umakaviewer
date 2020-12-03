import * as React from 'react'
import { Link } from 'react-router-dom'

import { Url, ADMIN_DATA_SET_SIZE_PER_PAGE } from '../../constants'
import { DataSetParams, DataSetResult } from '../../actions/admin'

interface Props {
  result: DataSetResult
  onChangePage: (params: DataSetParams) => void
}

export default class Paginate extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onClickLink = this.onClickLink.bind(this)
  }

  onClickLink(params: DataSetParams) {
    const { onChangePage } = this.props
    onChangePage(params)
  }

  private static get currentParams() {
    const params = new window.URL(window.location.href).searchParams
    const page = params.get('page')
    return {
      page: page ? parseInt(page, 10) : 1,
    }
  }

  private renderBack() {
    let component
    const { result } = this.props
    if (result.previous) {
      const params = Paginate.currentParams
      params.page -= 1
      const search = `?page=${params.page}`
      component = (
        <Link
          to={{ pathname: `${Url.Admin.PREFIX}${Url.Admin.DATA_SETS}`, search }}
          onClick={() => this.onClickLink(params)}
        >
          &lt;
        </Link>
      )
    } else {
      component = <span>&lt;</span>
    }
    return <div className="page">{component}</div>
  }

  private renderPages() {
    const { result } = this.props
    // 総ページ数を計算
    let maxPage = Math.floor(result.count / ADMIN_DATA_SET_SIZE_PER_PAGE)
    if (result.count % ADMIN_DATA_SET_SIZE_PER_PAGE >= 1) {
      maxPage += 1
    }
    const params = Paginate.currentParams
    // 各ページへのリンクを作成
    return Array(maxPage)
      .fill(0)
      .map((_, index) => {
        const page = index + 1
        const key = `paginate-page-${page}`
        const className = 'page'
        // 現在のページはリンクしない
        if (page === params.page) {
          return (
            <div key={key} className={className}>
              <span>{page}</span>
            </div>
          )
        }
        const search = `?page=${page}`
        const pageParams = { ...params }
        pageParams.page = page
        return (
          <div key={key} className={className}>
            <Link
              to={{
                pathname: `${Url.Admin.PREFIX}${Url.Admin.DATA_SETS}`,
                search,
              }}
              onClick={() => this.onClickLink(pageParams)}
            >
              {page}
            </Link>
          </div>
        )
      })
  }

  private renderNext() {
    let component
    const { result } = this.props
    if (result.next) {
      const params = Paginate.currentParams
      params.page += 1
      const search = `?page=${params.page}`
      component = (
        <Link
          to={{ pathname: `${Url.Admin.PREFIX}${Url.Admin.DATA_SETS}`, search }}
          onClick={() => this.onClickLink(params)}
        >
          &gt;
        </Link>
      )
    } else {
      component = <span>&gt;</span>
    }
    return <div className="page">{component}</div>
  }

  render() {
    return (
      <div className="paginate">
        {this.renderBack()}
        {this.renderPages()}
        {this.renderNext()}
      </div>
    )
  }
}
