import { Url } from './constants'

export const getWrapperClassName = () => {
  if (window.location.pathname.startsWith(Url.VISUALIZER_PREFIX)) {
    return 'wapper'
  }

  if (window.location.pathname.startsWith(Url.DATA_SET_SETTING)) {
    return 'wapper layout-dataset-setting'
  }

  switch (window.location.pathname) {
    case Url.TOP:
      return 'wapper layout-top'
    case Url.SIGN_UP:
    case Url.LOGIN:
      return 'wapper layout-login'
    case `${Url.SETTING}${Url.DELETE_USER}`:
    case `${Url.SETTING}${Url.UPDATE_USER}`:
      return 'wapper layout-setting'
    default:
      return 'wapper'
  }
}

export default getWrapperClassName
