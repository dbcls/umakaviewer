import * as React from 'react'
import moment from 'moment'
import { AxiosError } from 'axios'
import { push } from 'connected-react-router'
import {
  put,
  takeEvery,
  call,
  fork,
  select,
  all,
  delay,
} from 'redux-saga/effects'
import { reset, startSubmit, stopSubmit } from 'redux-form'
import { toast } from 'react-toastify'
import firebase from 'firebase/app'
import * as localforage from 'localforage'
import { FormattedMessage } from 'react-intl'

import {
  FormAttributes,
  Url,
  PERIOD_10_SECONDS,
  MAX_RETRY_COUNT,
} from '../constants'
import { AuthenticationActionNames } from '../actions/authentication'
import { UserActionNames, SubmitUserAttributesAction } from '../actions/user'
import { DataSetListActionNames, EditedDataSet } from '../actions/data-set-list'
import { GetDataSetAction, VisualizeActionNames } from '../actions/visualize'
import {
  UploadAction,
  DataSetUploadState,
  DataSetUploadActionNames,
  UploadErrorType,
} from '../actions/data-set-upload'
import { DataSetDeleteActionNames } from '../actions/data-set-delete'
import {
  DataSetSettingActionNames,
  GetDataSetSettingAction,
  UpdateDataSetSettingAction,
} from '../actions/data-set-setting'
import { LoadingActionNames } from '../actions/loading'
import ApiClient from '../ApiClient'
import { ReduxState } from '../store'

export enum RetryResult {
  SUCCESS = 0,
  MAX_RETRY_DONE = 1,
  NOT_UNAUTHORIZED_ERROR = 2,
  FIREBASE_NOT_SIGNED_IN = 3,
  LAST_RETRY_FAILURE = 4,
  GET_IDTOKEN_FAILURE = 5,
  BAD_REQUEST = 6,
  NOT_CONNECTED = 7,
}

export function* renewIdToken(counterIndex: number, err: any) {
  if (counterIndex >= MAX_RETRY_COUNT) {
    return RetryResult.MAX_RETRY_DONE
  }

  const error: AxiosError = err
  if (!error.response) {
    // サーバーと通信できていない
    return RetryResult.NOT_CONNECTED
  }

  if (error.response.status === 400) {
    return RetryResult.BAD_REQUEST
  }
  // APIサーバーからのレスポンスではない or 認証エラーではないなら何もしない
  if (error.response.status !== 401) {
    yield delay(1000)
    return RetryResult.NOT_UNAUTHORIZED_ERROR
  }

  const firebaseAuth = firebase.auth()
  // Firebaseで認証できていない
  if (!firebaseAuth.currentUser) {
    yield put({ type: AuthenticationActionNames.LOGOUT })
    return RetryResult.FIREBASE_NOT_SIGNED_IN
  }

  return RetryResult.SUCCESS
}

function* logout() {
  const firebaseAuth = firebase.auth()
  yield call([firebaseAuth, 'signOut'])

  yield call([localforage, 'clear'])
  yield call([ApiClient, 'removeUser'])
  yield put({ type: UserActionNames.UPDATE, user: null })
  yield put(push(Url.LOGIN))
}

function* getDataSetList() {
  yield put({ type: LoadingActionNames.START_LOADING })

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const res = yield call([ApiClient, 'getDataSetList'])
      const dataSetList = res.data.data.map((d: any) => ({
        ...d,
        upload_at: moment(d.upload_at),
      }))
      yield put({
        type: DataSetListActionNames.GET_DATA_SET_LIST_DONE,
        dataSetList,
      })
      yield put({ type: LoadingActionNames.FINISH_LOADING })
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
}

function* getVisualizedDataSet(action: GetDataSetAction) {
  const res = yield call([ApiClient, 'getVisualizedDataSet'], action.path)
  yield put({
    type: VisualizeActionNames.GET_DATA_SET_DONE,
    visualizedDataSet: res.data,
  })
}

function* signInOnAppStart() {
  // IdTokenを取得
  if (ApiClient.user) {
    const res = yield call([ApiClient, 'getMe'])
    yield put({ type: UserActionNames.UPDATE, user: { ...res.data } })
  }
}

function* uploadDataSetFile(action: UploadAction) {
  yield put({ type: DataSetUploadActionNames.UPLOADING })

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const res = yield call([ApiClient, 'uploadDataSet'], action.file)
      const dataSet = { ...res.data, upload_at: moment(res.data.upload_at) }
      yield put({
        type: DataSetListActionNames.ADD_DATA_SET,
        dataSet,
      })
      yield put({ type: DataSetUploadActionNames.UPLOAD_DONE })
      return
    } catch (e) {
      const result = yield renewIdToken(i, e)
      if (result === RetryResult.LAST_RETRY_FAILURE) {
        yield put({ type: DataSetUploadActionNames.CLOSE_MODAL })
        return
      }
      // JSONファイルが不正な場合はリトライしないで終了
      if (result === RetryResult.BAD_REQUEST) {
        yield put({
          type: DataSetUploadActionNames.UPLOAD_ERROR,
          errorType: e.response.data.message,
        })
        return
      }
    }
  }

  // ここまで来るのは不明なエラー
  yield put({
    type: DataSetUploadActionNames.UPLOAD_ERROR,
    errorType: null,
  })
}

const getDataSetUploadState = (state: ReduxState) => state.dataSetUpload

function* uploadForUmakaparser() {
  yield put({ type: DataSetUploadActionNames.UPLOADING })

  // 2ファイルが選択されているときだけ
  const dataSetUpload: DataSetUploadState = yield select(getDataSetUploadState)
  if (!dataSetUpload.sbmFile) {
    yield put({ type: DataSetUploadActionNames.CLOSE_MODAL })
    return
  }

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const res = yield call(
        [ApiClient, 'uploadForUmakaparser'],
        dataSetUpload.sbmFile,
        dataSetUpload.ontologyFile
      )
      yield put({ type: DataSetUploadActionNames.UPLOAD_DONE })
      yield put({
        type: DataSetUploadActionNames.ADD_TASK_ID,
        taskId: res.data.task_id,
      })
      return
    } catch (e) {
      const result = yield renewIdToken(i, e)
      if (result === RetryResult.LAST_RETRY_FAILURE) {
        yield put({ type: DataSetUploadActionNames.CLOSE_MODAL })
        return
      }
    }
  }

  // ここまで来るのは不明なエラー
  yield put({
    type: DataSetUploadActionNames.UPLOAD_ERROR,
    errorType: null,
  })
}

const getWillBeDeletedDataSet = (state: ReduxState) =>
  state.dataSetDelete.dataSet

function* deleteDataSet() {
  const dataSet = yield select(getWillBeDeletedDataSet)
  if (!dataSet) {
    return
  }

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      yield call([ApiClient, 'deleteDataSet'], dataSet.id)
      yield put({ type: DataSetListActionNames.REMOVE_DATA_SET, dataSet })
      yield put({ type: DataSetDeleteActionNames.CLOSE_MODAL })
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
  yield put({ type: DataSetDeleteActionNames.CLOSE_MODAL })
}

const getWillBeUpdatedDataSets = (state: ReduxState) => state.editedDataSets

function* updateDataSets() {
  const editedDataSets: EditedDataSet[] = yield select(getWillBeUpdatedDataSets)

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const effects = editedDataSets.map((d) =>
        call([ApiClient, 'updateDataSet'], d.id, { title: d.title })
      )
      yield all(effects)
      yield put({ type: DataSetListActionNames.UPDATE_DONE })
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
}

function* deleteUser() {
  yield put(startSubmit(FormAttributes.UserDelete.NAME))

  // ログインしているか確認
  const firebaseAuth = firebase.auth()
  if (!firebaseAuth.currentUser) {
    yield put({ type: UserActionNames.CLOSE_DELETE_MODAL })
    yield put(reset(FormAttributes.UserDelete.NAME))
    yield put(push(Url.LOGIN))
    return
  }

  // DBCLSのDBからUserを削除
  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      yield call([ApiClient, 'deleteMe'])
      break
    } catch (e) {
      const result = yield renewIdToken(i, e)
      if (result === RetryResult.LAST_RETRY_FAILURE) {
        yield put({ type: UserActionNames.CLOSE_DELETE_MODAL })
        yield put(reset(FormAttributes.UserDelete.NAME))
        return
      }
    }
  }

  // Firebaseから削除
  try {
    const { currentUser } = firebaseAuth
    yield call([currentUser, 'delete'])
  } catch (e) {
    const error = { _error: e.message }
    yield put(stopSubmit(FormAttributes.UserDelete.NAME, error))
    yield put({ type: UserActionNames.CLOSE_DELETE_MODAL })
    return
  }

  yield put({ type: UserActionNames.CLOSE_DELETE_MODAL })
  yield put(reset(FormAttributes.UserDelete.NAME))
  yield put(push(Url.SIGN_UP))
}

function* getDataSetSetting(action: GetDataSetSettingAction) {
  yield put({ type: LoadingActionNames.START_LOADING })

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const res = yield call([ApiClient, 'getDataSet'], action.id)
      yield put({
        type: DataSetSettingActionNames.GET_DATA_SET_DONE,
        dataSetSetting: { ...res.data },
      })
      yield put({ type: LoadingActionNames.FINISH_LOADING })
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
}

function* updateDataSetSetting(action: UpdateDataSetSettingAction) {
  yield put(startSubmit(FormAttributes.DataSetSetting.NAME))

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const res = yield call(
        [ApiClient, 'updateDataSet'],
        action.id,
        action.dataSetSetting
      )
      yield put({
        type: DataSetSettingActionNames.GET_DATA_SET_DONE,
        dataSetSetting: res.data,
      })
      yield put(reset(FormAttributes.DataSetSetting.NAME))
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
}

function* updateUser(action: SubmitUserAttributesAction) {
  yield put(startSubmit(FormAttributes.UserUpdate.NAME))

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const res = yield call([ApiClient, 'updateMe'], action.user)
      yield put({ type: UserActionNames.UPDATE, user: { ...res.data } })
      yield put(reset(FormAttributes.UserUpdate.NAME))
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
}

function* getResultOfUmakaparserTask(taskId: string, isFirst: boolean) {
  try {
    const res = yield call([ApiClient, 'getResultOfUmakaparserTask'], taskId)
    if (res.status === 200) {
      yield put({ type: DataSetUploadActionNames.REMOVE_TASK_ID, taskId })
      const dataSet = { ...res.data, upload_at: moment(res.data.upload_at) }
      yield put({
        type: DataSetListActionNames.ADD_DATA_SET,
        dataSet,
      })
      toast.success('オントロジー、SBMの処理が完了しました。', {
        position: 'bottom-right',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      })
    }
    // 202はまだ処理が開始されていない、204は処理中
  } catch (err) {
    const error: AxiosError = err
    if (error.response) {
      switch (error.response.status) {
        case 404:
          yield put({ type: DataSetUploadActionNames.REMOVE_TASK_ID, taskId })
          break
        case 400: {
          let errorMessageID: string
          switch (error.response.data.message) {
            case UploadErrorType.CONVERT_ERROR:
              errorMessageID = 'dataSetUpload.convertError'
              break
            case UploadErrorType.OWL_ERROR:
              errorMessageID = 'dataSetUpload.owlError'
              break
            case UploadErrorType.SBM_ERROR:
              errorMessageID = 'dataSetUpload.sbmError'
              break
            default:
              errorMessageID = 'dataSetUpload.defaultUploadErrorMessage'
              break
          }
          toast.error(<FormattedMessage id={errorMessageID} />, {
            position: 'bottom-right',
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
          })
          break
        }
        case 401:
          // 何回もトークンの更新が行われないように
          if (isFirst) {
            yield renewIdToken(err, 0)
          }
          break
        default:
      }
    }
  }
}

const getUmakaparserTasks = (state: ReduxState) => state.dataSetUpload.taskIds

function* checkUmakaparserTasks() {
  while (true) {
    const umakaparserTasks: string[] = yield select(getUmakaparserTasks)
    yield all(
      umakaparserTasks.map((taskId, index) =>
        call(getResultOfUmakaparserTask, taskId, index === 0)
      )
    )
    yield delay(PERIOD_10_SECONDS)
  }
}

export default function* userSaga() {
  yield fork(signInOnAppStart)
  yield fork(checkUmakaparserTasks)
  yield takeEvery(AuthenticationActionNames.LOGOUT, logout)
  yield takeEvery(DataSetListActionNames.GET_DATA_SET_LIST, getDataSetList)
  yield takeEvery(DataSetListActionNames.UPDATE, updateDataSets)
  yield takeEvery(VisualizeActionNames.GET_DATA_SET, getVisualizedDataSet)
  yield takeEvery(DataSetUploadActionNames.UPLOAD, uploadDataSetFile)
  yield takeEvery(
    DataSetUploadActionNames.UPLOAD_FOR_UMAKAPARSER,
    uploadForUmakaparser
  )
  yield takeEvery(DataSetDeleteActionNames.DELETE, deleteDataSet)
  yield takeEvery(UserActionNames.DELETE, deleteUser)
  yield takeEvery(DataSetSettingActionNames.GET_DATA_SET, getDataSetSetting)
  yield takeEvery(DataSetSettingActionNames.UPDATE, updateDataSetSetting)
  yield takeEvery(UserActionNames.SUBMIT_USER_ATTIBUTES, updateUser)
}
