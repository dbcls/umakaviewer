import * as React from 'react'
import { Route, Switch, match as RouteMatch } from 'react-router-dom'

import { Url } from '../../constants'
import { getWrapperClassName } from '../../utils'
import DataSetList from '../../containers/admin/DataSetList'

interface Props {
  match: RouteMatch
}

const Wrapper: React.SFC<Props> = ({ match }) => (
  <div className={getWrapperClassName()}>
    <main className="mainCol">
      <Switch>
        <Route
          path={`${match.url}${Url.Admin.DATA_SETS}`}
          component={DataSetList}
        />
      </Switch>
    </main>
  </div>
)

export default Wrapper
