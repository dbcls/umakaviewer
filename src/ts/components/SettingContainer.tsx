import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Url } from '../constants'

const MENU_LINK_ATTRIBUTES = [
  {
    url: `${Url.SETTING}${Url.UPDATE_USER}`,
    text: <FormattedMessage id="settingContainer.sectionUser" />,
  },
  {
    url: `${Url.SETTING}${Url.DELETE_USER}`,
    text: <FormattedMessage id="settingContainer.sectionAccount" />,
  },
]

const SettingContainer: React.SFC = ({ children }: any) => {
  const menus = MENU_LINK_ATTRIBUTES.map(({ url, text }) => {
    const className =
      window.location.pathname === url ? 'setting-submenu__on' : ''
    return (
      <li key={`setting-submenu-${url}`} className={className}>
        <Link to={url}>{text}</Link>
      </li>
    )
  })
  return (
    <>
      <section className="setting-submenu">
        <ul>{menus}</ul>
      </section>
      {children}
    </>
  )
}

export default SettingContainer
