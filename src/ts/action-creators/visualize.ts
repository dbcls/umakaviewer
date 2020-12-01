import { GetDataSetAction, VisualizeActionNames } from '../actions/visualize'

export const getDataSet = (path: string): GetDataSetAction => ({
  type: VisualizeActionNames.GET_DATA_SET,
  path,
})

export default getDataSet
