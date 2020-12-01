import React from 'react'
import { Prefixes } from '../types/prefix'

type PrefixProps = {
  prefixes: Prefixes
}

const Prefix: React.FC<PrefixProps> = (props) => {
  const { prefixes } = props

  const [isVisible, setVisible] = React.useState(false)
  const handleClick = React.useCallback(() => {
    setVisible(!isVisible)
  }, [isVisible])

  if (!Object.keys(prefixes).length) {
    return (
      <div className="prefix--link">
        <button type="button">PREFIX</button>
      </div>
    )
  }

  return (
    <div className={`prefix--link ${isVisible ? 'visible' : ''}`}>
      <button type="button" onClick={handleClick}>
        PREFIX
      </button>
      <div className="prefix--link__list">
        <dl>
          {Object.keys(prefixes)
            .sort()
            .map((key, idx) => [
              <dt key={`component-prefix-list-datatype-${idx}`}>
                @prefix : {key}
              </dt>,
              <dd key={`component-prefix-list-uri-${idx}`}>
                &lt;
                {prefixes[key]}
                &gt; .
              </dd>,
            ])}
        </dl>
      </div>
    </div>
  )
}

Prefix.displayName = 'Prefix'

export default Prefix
