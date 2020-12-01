import moment from 'moment'
import { put, takeEvery, call, select, all } from 'redux-saga/effects'

import { MAX_RETRY_COUNT, Url } from '../constants'
import { AdminActionNames, GetDataSetListAction } from '../actions/admin'
import { LoadingActionNames } from '../actions/loading'
import ApiClient from '../ApiClient'
import { ReduxState, history } from '../store'
import { renewIdToken } from './user'

function* getDataSetList(action: GetDataSetListAction) {
  yield put({ type: LoadingActionNames.START_LOADING })

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const res = yield call([ApiClient, 'getDataSetListAdmin'], action.params)
      const dataSetList = res.data.data.map((d: any) => ({
        ...d,
        upload_at: moment(d.upload_at),
      }))
      yield put({
        type: AdminActionNames.GET_DATA_SET_LIST_DONE,
        dataSetList,
      })
      yield put({
        type: AdminActionNames.UPDATE_DATA_SET_RESULT,
        result: {
          count: res.data.count,
          previous: res.data.previous,
          next: res.data.next,
        },
      })
      // ページが変わるので選択されているDataSetを解除
      yield put({ type: AdminActionNames.DESELECT_ALL_DATA_SETS })
      yield put({ type: LoadingActionNames.FINISH_LOADING })
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
}

const getSelectedDataSets = (state: ReduxState) => state.admin.selectedDataSets

function* deleteSelectedDataSets() {
  const selectedDataSets: number[] = yield select(getSelectedDataSets)

  for (let i = 0; i < MAX_RETRY_COUNT; i += 1) {
    try {
      const effects = selectedDataSets.map((id) =>
        call([ApiClient, 'deleteDataSetAdmin'], id)
      )
      yield all(effects)
      // ページを更新するために1ページ目を読み込む
      yield put({
        type: AdminActionNames.GET_DATA_SET_LIST,
        params: { page: 1 },
      })
      history.push({
        pathname: `${Url.Admin.PREFIX}${Url.Admin.DATA_SETS}`,
        search: '?page=1',
      })
      return
    } catch (e) {
      yield renewIdToken(i, e)
    }
  }
}

export default function* adminSaga() {
  yield takeEvery(AdminActionNames.GET_DATA_SET_LIST, getDataSetList)
  yield takeEvery(
    AdminActionNames.DELETE_SELECTED_DATA_SETS,
    deleteSelectedDataSets
  )
}
