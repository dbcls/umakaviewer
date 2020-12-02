import * as React from 'react'
import { Route } from 'react-router-dom'

import { Url } from '../constants'
import SettingContainer from './SettingContainer'
import UserDelete from '../containers/UserDelete'
import UserDeleteModal from '../containers/UserDeleteModal'
import UserUpdate from '../containers/UserUpdate'

const SettingRouter: React.SFC = ({ match }: any) => {
  return (
    <SettingContainer>
      <Route path={`${match.url}${Url.DELETE_USER}`} component={UserDelete} />
      <Route
        path={`${match.url}${Url.DELETE_USER}`}
        component={UserDeleteModal}
      />
      <Route path={`${match.url}${Url.UPDATE_USER}`} component={UserUpdate} />
    </SettingContainer>
  )
}

export default SettingRouter
