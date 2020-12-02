import * as React from 'react'
import { FormattedMessage } from 'react-intl'

// valuesを使用するときはmessageIdsと数を合わせる
interface Props {
  messageIds: string[]
  values?: any[]
}

const MultiLineMessage = (props: Props) => {
  const { messageIds, values } = props
  return (
    <div className="multiLineMessage">
      {messageIds.map((id: string, index: number) => (
        <div key={id} className="oneLineMessage">
          <FormattedMessage
            id={id}
            values={values === undefined ? undefined : values[index]}
          />
        </div>
      ))}
    </div>
  )
}

export default MultiLineMessage
