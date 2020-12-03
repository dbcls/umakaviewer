import { Action } from 'redux'

export enum LoadingActionNames {
  START_LOADING = 'loading/start',
  FINISH_LOADING = 'loading/finish',
}

interface StartLoadingAction extends Action {
  type: LoadingActionNames.START_LOADING
}

interface FinishLoadingAction extends Action {
  type: LoadingActionNames.FINISH_LOADING
}

export type LoadingActions = StartLoadingAction | FinishLoadingAction
