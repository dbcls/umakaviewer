import { createBrowserHistory } from 'history'
import {
  createStore,
  combineReducers,
  compose,
  Action,
  applyMiddleware,
} from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { reducer as formReducer } from 'redux-form'
import createSagaMiddleware from 'redux-saga'

import { SignUpActions } from '../actions/signup'
import { AuthenticationActions } from '../actions/authentication'
import { CurrentUser, UserActions, UserDeleteState } from '../actions/user'
import {
  DataSet,
  DataSetListActions,
  EditedDataSet,
  PublicDataSet,
  PublicDataSetResult,
  PublicDisplayMethod,
} from '../actions/data-set-list'
import {
  DataSetUploadState,
  DataSetUploadActions,
} from '../actions/data-set-upload'
import {
  DataSetDeleteState,
  DataSetDeleteActions,
} from '../actions/data-set-delete'
import {
  CurrentDataSetSetting,
  DataSetSettingActions,
} from '../actions/data-set-setting'
import { VisualizedDataSet, VisualizeActions } from '../actions/visualize'
import { LoadingActions } from '../actions/loading'
import userReducer, { userDeleteReducer } from '../reducers/user'
import dataSetListReducer, {
  editedDataSetsReducer,
  publicDataSetListReducer,
  publicDataSetResultReducer,
  publicDisplayMethodReducer,
} from '../reducers/data-set-list'
import dataSetUploadReducer from '../reducers/data-set-upload'
import dataSetDeleteReducer from '../reducers/data-set-delete'
import dataSetSettingReducer from '../reducers/data-set-setting'
import visualizedDataSetReducer from '../reducers/visualize'
import loadingReducer from '../reducers/loading'
import { adminReducer, AdminState } from './admin'
import { AdminActions } from '../actions/admin'

export const history = createBrowserHistory()

export default function configureStore(initialState: object = {}) {
  const sagaMiddleware = createSagaMiddleware()
  return {
    ...createStore(
      combineReducers({
        router: connectRouter(history),
        form: formReducer,
        currentUser: userReducer,
        dataSetList: dataSetListReducer,
        editedDataSets: editedDataSetsReducer,
        visualizedDataSet: visualizedDataSetReducer,
        dataSetUpload: dataSetUploadReducer,
        dataSetDelete: dataSetDeleteReducer,
        userDelete: userDeleteReducer,
        dataSetSetting: dataSetSettingReducer,
        publicDataSetList: publicDataSetListReducer,
        publicDataSetResult: publicDataSetResultReducer,
        publicDisplayMethod: publicDisplayMethodReducer,
        isLoading: loadingReducer,
        admin: adminReducer,
      }),
      initialState,
      compose(applyMiddleware(routerMiddleware(history), sagaMiddleware))
    ),
    runSaga: sagaMiddleware.run,
  }
}

export type ReduxState = {
  currentUser: CurrentUser
  dataSetList: DataSet[]
  editedDataSets: EditedDataSet[]
  visualizedDataSet: VisualizedDataSet
  dataSetUpload: DataSetUploadState
  dataSetDelete: DataSetDeleteState
  userDelete: UserDeleteState
  dataSetSetting: CurrentDataSetSetting
  publicDataSetList: PublicDataSet[]
  publicDataSetResult: PublicDataSetResult
  publicDisplayMethod: PublicDisplayMethod
  isLoading: boolean
  admin: AdminState
}

export type ReduxAction =
  | SignUpActions
  | AuthenticationActions
  | UserActions
  | DataSetListActions
  | VisualizeActions
  | DataSetUploadActions
  | DataSetDeleteActions
  | DataSetSettingActions
  | LoadingActions
  | AdminActions
  | Action
