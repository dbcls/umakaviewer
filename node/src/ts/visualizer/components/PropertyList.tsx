import React, { useCallback, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { UiAction } from '../actions/ui'
import { RootState } from '../reducers'
import { Property as PropertyType } from '../types/property'
import HideableWrapper from './HideableWrapper'
import Property from './Property'

type PropertyListProps = {
  properties: PropertyType[]
}

const selector = ({
  ui: { propertyPaneVisibility },
  property: { openPropertyIndexes },
}: RootState) => ({
  propertyPaneVisibility,
  openPropertyIndexes,
})

const PropertyList: React.FC<PropertyListProps> = (props) => {
  const { properties } = props
  const { propertyPaneVisibility, openPropertyIndexes } = useSelector(selector)
  const dispatch = useDispatch()
  const intl = useIntl()

  useEffect(() => {
    ReactTooltip.rebuild()
  }, [properties, openPropertyIndexes])

  const handleToggle = useCallback(() => {
    dispatch(UiAction.hidePropertyPane())
  }, [dispatch])

  return (
    <HideableWrapper
      target={intl.formatMessage({ id: 'propertyList.hideableWrapper.target' })}
      toggleHandler={handleToggle}
      visibility={propertyPaneVisibility}
      icon="left"
      attrs={{ id: 'properties' }}
    >
      <div id="properties-header">
        <h2>
          <FormattedMessage id="propertyList.title" />
        </h2>
        <ul className="legend">
          <li>
            <span className="text">
              <FormattedMessage id="propertyList.legend.text" />
            </span>
          </li>
          <li>
            <span className="triple-count">
              <FormattedMessage id="propertyList.legend.tripleCount" />
            </span>
          </li>
        </ul>
      </div>
      <ul id="properties-list">
        {properties.map((property, index) => (
          <Property
            key={`component-propertylist-list-property-${index}`}
            index={index}
            property={property}
          />
        ))}
      </ul>
    </HideableWrapper>
  )
}

PropertyList.displayName = 'PropertyList'

export default PropertyList
