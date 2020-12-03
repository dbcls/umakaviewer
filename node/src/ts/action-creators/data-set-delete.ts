import {
  OpenModalAction,
  CloseModalAction,
  DeleteAction,
  DataSetDeleteActionNames,
} from '../actions/data-set-delete'
import { DataSet } from '../actions/data-set-list'

export const openModal = (dataSet: DataSet): OpenModalAction => ({
  type: DataSetDeleteActionNames.OPEN_MODAL,
  dataSet,
})

export const closeModal = (): CloseModalAction => ({
  type: DataSetDeleteActionNames.CLOSE_MODAL,
})

export const deleteDataSet = (): DeleteAction => ({
  type: DataSetDeleteActionNames.DELETE,
})

export default openModal
