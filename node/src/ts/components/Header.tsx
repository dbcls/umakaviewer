import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTh, faDatabase, faUserLock } from '@fortawesome/free-solid-svg-icons'

import { Url, Color } from '../constants'
import { getWrapperClassName } from '../utils'
import { LogoutAction } from '../actions/authentication'
import { CurrentUser, UserRoleTypes } from '../actions/user'
import { CurrentDataSetSetting } from '../actions/data-set-setting'
import { VisualizedDataSet } from '../actions/visualize'
import { history } from '../store'

interface Props {
  currentUser: CurrentUser
  dataSetSetting: CurrentDataSetSetting
  umakaparserTasksCount: number
  dataSet: VisualizedDataSet
  isAuthenticated: boolean
  actions: {
    logout: () => LogoutAction
  }
}

export default class Header extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onClickLogout = this.onClickLogout.bind(this)
    this.onClickBack = this.onClickBack.bind(this)
  }

  private static renderDefault() {
    return (
      <h1>
        <FormattedMessage id="header.h1Default" />
      </h1>
    )
  }

  private static renderLogin() {
    return (
      <h1>
        <FormattedMessage id="header.h1Login" />
      </h1>
    )
  }

  private onClickLogout(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const { actions } = this.props
    actions.logout()
  }

  private onClickBack(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { isAuthenticated } = this.props
    if (isAuthenticated) {
      history.replace(Url.TOP)
    } else {
      history.replace('/login')
    }
  }

  private renderHeader() {
    if (window.location.pathname.startsWith(Url.DATA_SET_SETTING)) {
      return this.renderDataSetSetting()
    }

    if (window.location.pathname.startsWith(Url.Admin.PREFIX)) {
      return this.renderAdmin()
    }

    if (window.location.pathname.startsWith(Url.VISUALIZER_PREFIX)) {
      return this.renderVisualize()
    }

    switch (window.location.pathname) {
      case Url.LOGIN:
        return Header.renderLogin()
      case Url.TOP:
      case `${Url.SETTING}${Url.DELETE_USER}`:
      case `${Url.SETTING}${Url.UPDATE_USER}`:
      case Url.PUBLIC_DATA_SETS:
        return this.renderTop()
      default:
        return Header.renderDefault()
    }
  }

  private renderRightMenu() {
    const { umakaparserTasksCount, currentUser } = this.props
    const umakaparserTaskIcon =
      umakaparserTasksCount > 0 ? (
        <span className="header-menu__faicon">
          <FontAwesomeIcon size="2x" icon={faDatabase} />
          <span className="header-menu__faicon--badge">
            {umakaparserTasksCount}
          </span>
        </span>
      ) : null
    const isAdmin =
      currentUser &&
      currentUser.roles.find((r) => r === UserRoleTypes.ADMIN) !== undefined
    const adminIcon = isAdmin ? (
      <Link to={`${Url.Admin.PREFIX}${Url.Admin.DATA_SETS}`}>
        <span className="header-menu__faicon">
          <FontAwesomeIcon size="2x" icon={faUserLock} color={Color.GRAY_CCC} />
        </span>
      </Link>
    ) : null
    return (
      <>
        <ul className="header-menu">
          <li>
            <Link to={Url.TOP} className="header-menu__menu-icon">
              <span>
                <FormattedMessage id="header.linkHome" />
              </span>
            </Link>
          </li>
          <li className="header-menu__setting">
            <span className="header-menu__menu-icon">
              <span>
                <FormattedMessage id="header.linkSettings" />
              </span>
            </span>
            <div className="header-menu__settingmenu">
              <p>
                <Link to={`${Url.SETTING}${Url.UPDATE_USER}`}>
                  <FormattedMessage id="header.linkUserSetting" />
                </Link>
              </p>
              <p>
                <Link to={`${Url.SETTING}${Url.DELETE_USER}`}>
                  <FormattedMessage id="header.linkAccountSetting" />
                </Link>
              </p>
              <p>
                <Link onClick={this.onClickLogout} to={Url.TOP}>
                  <FormattedMessage id="header.linkLogout" />
                </Link>
              </p>
            </div>
          </li>
        </ul>
        <Link to={Url.PUBLIC_DATA_SETS}>
          <span className="header-menu__faicon">
            <FontAwesomeIcon size="2x" icon={faTh} color={Color.GRAY_CCC} />
          </span>
        </Link>
        {adminIcon}
        {umakaparserTaskIcon}
      </>
    )
  }

  private renderTop() {
    const { currentUser } = this.props
    if (!currentUser) {
      return Header.renderDefault()
    }
    return (
      <>
        <h1>Umaka Viewer</h1>
        {this.renderRightMenu()}
      </>
    )
  }

  private renderDataSetSetting() {
    const { dataSetSetting } = this.props
    if (!dataSetSetting) {
      return Header.renderDefault()
    }

    return (
      <>
        <h1 className="back">
          <Link to={Url.TOP}>
            <FormattedMessage id="header.linkBack" />
          </Link>
        </h1>
        <div className="header-dataset-setting">
          <span className="dataset-setting__title">
            <FormattedMessage
              id="header.titleSetting"
              values={{ title: dataSetSetting.title }}
            />
          </span>
        </div>
        {this.renderRightMenu()}
      </>
    )
  }

  private renderAdmin() {
    const { currentUser } = this.props
    if (!currentUser) {
      return Header.renderDefault()
    }
    return (
      <>
        <h1>
          <FormattedMessage id="header.h1Admin" />
        </h1>
        {this.renderRightMenu()}
      </>
    )
  }

  private renderVisualize() {
    const { dataSet } = this.props
    return (
      <div className="header-visualize-dataset">
        <h1>
          <Link onClick={this.onClickBack} to={Url.TOP}>
            Umaka Viewer
          </Link>
        </h1>
        <h1 className="visualize-dataset__title">{dataSet && dataSet.title}</h1>
      </div>
    )
  }

  render() {
    return (
      <div className={getWrapperClassName()}>
        <header className="header">{this.renderHeader()}</header>
      </div>
    )
  }
}
