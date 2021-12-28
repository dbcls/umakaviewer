/* eslint-disable camelcase */
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { PropertyAction } from '../actions/property'
import { RootState } from '../reducers'
import { ClassRelation as ClassRelationType } from '../types/property'

type ClassRelationProps = {
  relation: ClassRelationType
  selected: boolean
  indexes: [number, number]
  propertyClass?: string
}

const ClassRelation: React.FC<ClassRelationProps> = (props) => {
  const {
    relation: { subject_class, object_class, object_datatype, triples },
    selected,
    indexes: [index1, index2],
    propertyClass,
  } = props
  const dispatch = useDispatch()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      e.stopPropagation()
      dispatch(
        DetailAction.showPropertyClass(
          propertyClass ?? null,
          subject_class,
          object_class || object_datatype
        )
      )
      dispatch(PropertyAction.selectPropertyClass(index1, index2))
    },
    [dispatch, index1, index2, object_class, object_datatype, subject_class]
  )

  const isDomainRange = subject_class === object_class
  const domainClassName = isDomainRange ? 'domain-range-class' : 'domain-class'
  const rangeClassName = isDomainRange ? 'domain-range-class' : 'range-class'
  const className = selected ? 'selected' : ''
  const literalClassName = object_datatype ? 'range-literal' : ''

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li className={className} onClick={handleClick} onKeyDown={() => false}>
      <span className="hook">└</span>
      <p className="relation-classes">
        {subject_class && (
          <span className="classes">
            <span className="icon subject">S</span>
            <span className={`text ${domainClassName}`}>
              {subject_class || 'resource'}
            </span>
          </span>
        )}
        {subject_class && object_class && <span className="margin" />}
        {(object_class || object_datatype) && (
          <span className="classes">
            <span className="icon object">O</span>
            <span
              className={['text', rangeClassName, literalClassName].join(' ')}
            >
              {object_class || object_datatype || 'resource'}
            </span>
          </span>
        )}
      </p>
      <span className="triple-count">{triples}</span>
    </li>
  )
}

ClassRelation.displayName = 'ClassRelation'

type ClassRelationsProps = {
  classRelations: ClassRelationType[]
  index: number
  propertyClass?: string
}

const selector = ({ property: { showPropertyClassIndex } }: RootState) => ({
  showPropertyClassIndex,
})

const ClassRelations: React.FC<ClassRelationsProps> = (props) => {
  const { classRelations, index, propertyClass } = props
  const {
    showPropertyClassIndex: [selectedIndex1, selectedIndex2],
  } = useSelector(selector)

  return (
    <ul className="class-relations">
      {classRelations.map((relation, key) => (
        <ClassRelation
          key={`component-classrelations-list-classrelation-${key}`}
          relation={relation}
          indexes={[index, key]}
          selected={selectedIndex1 === index && selectedIndex2 === key}
          propertyClass={propertyClass}
        />
      ))}
    </ul>
  )
}

ClassRelations.displayName = 'ClassRelations'

export default ClassRelations
