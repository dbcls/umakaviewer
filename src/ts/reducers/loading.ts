import { LoadingActionNames, LoadingActions } from '../actions/loading'

const initialLoadingState = false

export default function loadingReducer(
  state: boolean = initialLoadingState,
  action: LoadingActions
): boolean {
  switch (action.type) {
    case LoadingActionNames.START_LOADING:
      return true
    case LoadingActionNames.FINISH_LOADING:
      return false
    default:
      return state
  }
}
