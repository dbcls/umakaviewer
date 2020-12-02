import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

const Loading: React.SFC = () => (
  <div className="loading">
    <FontAwesomeIcon
      icon={faCircleNotch}
      size="5x"
      color="#40b9c4"
      spin
      style={{ animationDuration: '1.2s' }}
    />
  </div>
)

export default Loading
