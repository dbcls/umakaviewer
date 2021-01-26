import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import firebase from 'firebase/app'
import 'firebase/auth'

import configureStore, { history } from './store'
import App from './components/App'
import rootSaga from './sagas'
import '../style/style.scss'
import '../style/server/style.css'

declare const FIREBASE_CONFIG: object

async function makeInitialState() {
  return {}
}

// eslint-disable-next-line prettier/prettier
(async function main() {
  firebase.initializeApp(FIREBASE_CONFIG)

  const store = configureStore(await makeInitialState())

  const runRootSaga = () => {
    store.runSaga(rootSaga)
  }

  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App runRootSaga={runRootSaga} />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('appContainer')
  )
})()
