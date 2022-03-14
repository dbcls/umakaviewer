/* eslint-disable camelcase */
import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { PropertyAction } from '../actions/property'
import { RootState } from '../reducers'
import { ClassRelation as ClassRelationType } from '../types/property'
import { omitUri } from '../utils'

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

  const subjectTip = useMemo(() => {
    if (!subject_class) {
      return undefined
    }
    return subject_class !== omitUri(subject_class) ? subject_class : undefined
  }, [subject_class])

  const objectTip = useMemo(() => {
    if (object_class) {
      return object_class !== omitUri(object_class) ? object_class : undefined
    }
    if (object_datatype) {
      return object_datatype !== omitUri(object_datatype)
        ? object_datatype
        : undefined
    }
    return undefined
  }, [object_class])

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li className={className} onClick={handleClick} onKeyDown={() => false}>
      <span className="hook">└</span>
      <p className="relation-classes">
        {subject_class && (
          <span
            className="classes"
            style={{
              marginBottom: '8px',
            }}
          >
            <span className="icon subject">S</span>
            <span data-tip={subjectTip} className={`text ${domainClassName}`}>
              {subject_class ? omitUri(subject_class) : 'resource'}
            </span>
          </span>
        )}
        {(object_class || object_datatype) && (
          <span className="classes">
            <span className="icon object">O</span>
            <span
              className={['text', rangeClassName, literalClassName].join(' ')}
              data-tip={objectTip}
            >
              {(() => {
                if (object_class) {
                  return omitUri(object_class)
                }
                if (object_datatype) {
                  return omitUri(object_datatype)
                }
                return 'resource'
              })()}
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
