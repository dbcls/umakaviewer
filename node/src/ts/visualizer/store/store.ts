import { createStore } from 'redux'
import rootReducer from '../reducers'

export default function configureStore() {
  const store = createStore(rootReducer)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers') // eslint-disable-line global-require, @typescript-eslint/no-var-requires
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
