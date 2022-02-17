/* eslint-disable camelcase */
import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PropertyAction } from '../actions/property'
import { RootState } from '../reducers'
import { Property as PropertyType } from '../types/property'
import ClassRelations from './ClassRelations'
import { omitUri } from '../utils'

type PropertyProps = {
  property: PropertyType
  index: number
}

const selector = ({
  property: { openPropertyIndexes, referenceProperties },
}: RootState) => ({
  openPropertyIndexes,
  referenceProperties,
})

const Property: React.FC<PropertyProps> = (props) => {
  const {
    property: { class_relations, triples, uri },
    index,
  } = props
  const { openPropertyIndexes, referenceProperties } = useSelector(selector)
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    if (openPropertyIndexes[index]) {
      dispatch(PropertyAction.closeProperty(index))
    } else {
      dispatch(PropertyAction.showProperty(index))
    }
  }, [dispatch, index, openPropertyIndexes])

  const isOpen = openPropertyIndexes[index]

  const refered = uri in referenceProperties.properties ? 'refered' : ''
  const open = isOpen ? 'open' : ''
  const className = [refered, open].join(' ')

  const isOmittingUri = useMemo(() => {
    return omitUri(uri) !== uri
  }, [uri])

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      className={className}
      onClick={class_relations.length ? handleClick : undefined}
      onKeyDown={() => false}
    >
      <span className="property" data-tip={isOmittingUri ? uri : undefined}>
        {omitUri(uri)}
      </span>
      <span className="triple-count">{triples}</span>
      {class_relations.length > 0 && <span className="open-toggle" />}
      {isOpen && (
        <ClassRelations
          index={index}
          classRelations={class_relations}
          propertyClass={uri}
        />
      )}
    </li>
  )
}

Property.displayName = 'Property'

export default Property
