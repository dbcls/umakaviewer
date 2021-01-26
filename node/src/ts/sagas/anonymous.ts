import moment from 'moment'
import { push } from 'connected-react-router'
import { put, takeEvery, call } from 'redux-saga/effects'
import { reset, startSubmit, stopSubmit } from 'redux-form'
import firebase from 'firebase/app'

import { FormAttributes, Url } from '../constants'
import { SignUpActionNames } from '../actions/signup'
import { UserActionNames } from '../actions/user'
import { AuthenticationActionNames } from '../actions/authentication'
import {
  DataSetListActionNames,
  GetPublicDataSetListAction,
} from '../actions/data-set-list'
import { LoadingActionNames } from '../actions/loading'
import ApiClient from '../ApiClient'

function* signUp() {
  yield put(startSubmit(FormAttributes.SignUp.NAME))

  // Firebaseに登録
  let firebaseUid
  let userDisplayName
  const firebaseAuth = firebase.auth()
  try {
    const provider = new firebase.auth.GoogleAuthProvider()
    const res = yield call([firebaseAuth, 'signInWithPopup'], provider)
    firebaseUid = res.user.uid
    userDisplayName = res.user.displayName
  } catch (e) {
    const error = { _error: e.message }
    yield put(stopSubmit(FormAttributes.SignUp.NAME, error))
    return
  }

  // DBCLSのDBに登録
  try {
    yield call([ApiClient, 'signUp'], firebaseUid, userDisplayName)
  } catch (e) {
    const error = { _error: e.response.data.message }
    yield put(stopSubmit(FormAttributes.SignUp.NAME, error))
    return
  }

  // idTokenを取得
  if (!firebaseAuth.currentUser) {
    throw new Error('something wrong')
  }
  try {
    yield call([ApiClient, 'setUser'], firebaseAuth.currentUser)
  } catch (e) {
    const error = { _error: e.message }
    yield put(stopSubmit(FormAttributes.SignUp.NAME, error))
  }

  yield put({
    type: UserActionNames.UPDATE,
    user: { display_name: userDisplayName, contact_uri: '', roles: [] },
  })
  yield put(reset(FormAttributes.SignUp.NAME))
  yield put(push(Url.TOP))
}

function* login() {
  yield put(startSubmit(FormAttributes.Login.NAME))

  // Firebaseでログイン
  const firebaseAuth = firebase.auth()
  try {
    const provider = new firebase.auth.GoogleAuthProvider()
    yield call([firebaseAuth, 'signInWithPopup'], provider)
  } catch (e) {
    const error = { _error: e.message }
    yield put(stopSubmit(FormAttributes.Login.NAME, error))
    return
  }

  if (!firebaseAuth.currentUser) {
    throw new Error('something wrong')
  }

  let res
  try {
    const token = yield call([firebaseAuth.currentUser, 'getIdToken'])
    yield call([ApiClient, 'setUser'], firebaseAuth.currentUser)
    res = yield call([ApiClient, 'login'], token)
  } catch (e) {
    if (e.response) {
      const error = { _error: e.response.data.message }
      yield put(stopSubmit(FormAttributes.Login.NAME, error))
    }
    return
  }

  // Userデータを設定してTopに移動
  const { data } = res
  yield put({
    type: UserActionNames.UPDATE,
    user: {
      display_name: data.display_name,
      contact_uri: data.contact_uri,
      roles: data.roles,
    },
  })
  yield put(reset(FormAttributes.Login.NAME))
  yield put(push(Url.TOP))
}

function* getPublicDataSetList(action: GetPublicDataSetListAction) {
  yield put({ type: LoadingActionNames.START_LOADING })

  try {
    const res = yield call([ApiClient, 'getPublicDataSetList'], action.params)
    const publicDataSetList = res.data.data.map((d: any) => ({
      ...d,
      upload_at: moment(d.upload_at),
    }))
    yield put({
      type: DataSetListActionNames.GET_PUBLIC_DATA_SET_LIST_DONE,
      publicDataSetList,
    })
    yield put({
      type: DataSetListActionNames.UPDATE_PUBLIC_DATA_SET_RESULT,
      result: {
        count: res.data.count,
        previous: res.data.previous,
        next: res.data.next,
      },
    })
  } catch (e) {
    yield put({
      type: DataSetListActionNames.GET_PUBLIC_DATA_SET_LIST_DONE,
      publicDataSetList: [],
    })
  }

  yield put({ type: LoadingActionNames.FINISH_LOADING })
}

export default function* anonymousSaga() {
  yield takeEvery(SignUpActionNames.SIGN_UP, signUp)
  yield takeEvery(AuthenticationActionNames.LOGIN, login)
  yield takeEvery(
    DataSetListActionNames.GET_PUBLIC_DATA_SET_LIST,
    getPublicDataSetList
  )
}
