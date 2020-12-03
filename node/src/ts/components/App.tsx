import * as React from 'react'
import { Route } from 'react-router-dom'
import { IntlProvider } from 'react-intl'

import firebase from 'firebase/app'
import { Url } from '../constants'
import localeMessages from '../locales'
import Header from '../containers/Header'
import Wrapper from './Wrapper'
import AdminWrapper from './admin/Wrapper'
import ApiClient from '../ApiClient'

const App = (props: { runRootSaga: () => void }) => {
  const [firebaseUser, setFirebaseUser] = React.useState<
    firebase.User | null | undefined
  >(undefined)
  React.useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        ApiClient.setUser(user)
      } else {
        ApiClient.removeUser()
      }
      setFirebaseUser((val) => {
        if (val === undefined) {
          props.runRootSaga()
        }
        return user
      })
    })
    return () => {
      unsubscribe()
    }
  })

  return (
    <div>
      <IntlProvider
        locale={navigator.language}
        messages={localeMessages[navigator.language] || localeMessages.en}
      >
        {firebaseUser !== undefined && (
          <>
            <Route path="/" component={Header} />
            <Route path="/" component={Wrapper} />
            <Route path={Url.Admin.PREFIX} component={AdminWrapper} />
          </>
        )}
      </IntlProvider>
    </div>
  )
}

export default App
