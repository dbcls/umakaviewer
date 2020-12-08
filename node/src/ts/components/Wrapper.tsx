import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import { Url } from '../constants'
import { getWrapperClassName } from '../utils'
import SignUp from '../containers/SignUp'
import Login from '../containers/Login'
import DataSetList from '../containers/DataSetList'
import Visualize from '../containers/Visualize'
import DataSetSetting from '../containers/DataSetSetting'
import SettingRouter from './SettingRouter'
import PublicDataSetViewer from '../containers/PublicDataSetViewer'
import { useDBCLSFooter } from '../useDBCLSFooter'

const Wrapper: React.SFC = () => {
  useDBCLSFooter()
  return (
    <div className={getWrapperClassName()}>
      <main className="mainCol">
        <Switch>
          <Route path={Url.SIGN_UP} component={SignUp} />
          <Route path={Url.LOGIN} component={Login} />
          <Route exact path={Url.TOP} component={DataSetList} />
          <Route
            path={`${Url.VISUALIZER_PREFIX}/:path`}
            component={Visualize}
          />
          <Route path={Url.SETTING} component={SettingRouter} />
          <Route
            path={`${Url.DATA_SET_SETTING}/:id`}
            component={DataSetSetting}
          />
          <Route path={Url.PUBLIC_DATA_SETS} component={PublicDataSetViewer} />
        </Switch>
      </main>
    </div>
  )
}

export default Wrapper
