import * as React from 'react'
import { GetDataSetAction, VisualizedDataSet } from '../actions/visualize'

import Visualizer, { Content } from '../visualizer'

interface Props {
  match: {
    params: { path: string }
  }
  dataSet: VisualizedDataSet
  actions: {
    getDataSet: (path: string) => GetDataSetAction
  }
}

const Visualize = (props: Props) => {
  const { actions, match, dataSet } = props
  const [content, setContent] = React.useState<Content>({
    inheritance_structure: [],
    classes: {},
    properties: [],
    prefixes: {},
    meta_data: {},
  })

  React.useEffect(() => {
    actions.getDataSet(match.params.path)
  }, [actions, match])

  React.useEffect(() => {
    if (dataSet) {
      setContent(dataSet.content)
    }
  }, [dataSet])

  return (
    <div id="content">
      <Visualizer content={content} />
    </div>
  )
}

export default Visualize
