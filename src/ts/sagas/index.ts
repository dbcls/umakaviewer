import { fork } from 'redux-saga/effects'

import userSaga from './user'
import anonymousSaga from './anonymous'
import adminSaga from './admin'

export default function* rootSaga() {
  yield fork(userSaga)
  yield fork(anonymousSaga)
  yield fork(adminSaga)
}
