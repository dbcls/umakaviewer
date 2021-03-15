import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { Classes } from '../types/class'
import { getPreferredLabel } from '../utils'
import GraphRepository from '../utils/GraphRepository'

type ClassRelationsDetailProps = {
  title: string
  classes: Classes
  fromPropertySelection?: boolean
  focusingURI: string | null
  showLeftHand: boolean
  showRightHand: boolean
}

const ClassRelationsDetail: React.FC<ClassRelationsDetailProps> = (props) => {
  const {
    title,
    classes,
    fromPropertySelection,
    focusingURI,
    showLeftHand,
    showRightHand,
  } = props
  const dispatch = useDispatch()
  const intl = useIntl()
  const classDetail = useMemo(() => classes[focusingURI || ''], [
    classes,
    focusingURI,
  ])

  const getPreferredTriple = useCallback(
    (triple: string[]) => {
      if (triple.length < 3) {
        return '<><><>'
      }
      const subject = getPreferredLabel(triple[0], classes, intl.locale)
      const predicate = getPreferredLabel(triple[1], classes, intl.locale)
      const object = getPreferredLabel(triple[2], classes, intl.locale)
      return `<${subject}><${predicate}><${object}>`
    },
    [classes, intl.locale]
  )

  const focusPropertyClass = useCallback(() => {
    const target = GraphRepository.findUriNode(focusingURI)
    dispatch(
      DetailAction.focusPropertyClass(
        target ? target.data.key : null,
        focusingURI
      )
    )
  }, [dispatch, focusingURI])

  const handleClickRightHandSideClasses = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      if (fromPropertySelection) {
        focusPropertyClass()
      }
      dispatch(DetailAction.showRightHandSideClasses())
    },
    [dispatch, focusPropertyClass, fromPropertySelection]
  )

  const handleClickLeftHandSideClasses = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      if (fromPropertySelection) {
        focusPropertyClass()
      }
      dispatch(DetailAction.showLeftHandSideClasses())
    },
    [dispatch, focusPropertyClass, fromPropertySelection]
  )

  const handleClickRelationClass = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      if (fromPropertySelection) {
        focusPropertyClass()
      }
      dispatch(DetailAction.showAllAssociatedClasses())
    },
    [dispatch, focusPropertyClass, fromPropertySelection]
  )

  const headerElement = useMemo(
    () => (
      <h2 className="relation-class">
        <button type="button" onClick={handleClickRelationClass}>
          {title}
        </button>
      </h2>
    ),
    [handleClickRelationClass, title]
  )

  const subjectElement = useMemo(
    () => (
      <>
        <h3 className={`relation-header${showRightHand ? ' open' : ''}`}>
          <button type="button" onClick={handleClickRightHandSideClasses}>
            {intl.formatMessage({
              id: 'classRelationsDetail.triple.with.this.class.as.subject',
            })}
            <span className="open-toggle" />
          </button>
        </h3>
        {showRightHand && classDetail.rhs && (
          <ul className="triples">
            {classDetail.rhs.map((rhs, index) => {
              const relationClass = (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                e.preventDefault()
                dispatch(DetailAction.showRelation(rhs))
              }
              const triple = [focusingURI || '', rhs[0], rhs[1]]
              return (
                <li key={`component-classrelationdetail-list-rhs-${index}`}>
                  <button
                    type="button"
                    title={getPreferredTriple(triple)}
                    onClick={relationClass}
                  >
                    <span className="focusing">
                      {`<${triple[0]}>`}
                      &nbsp;
                    </span>
                    <span>{`<${triple[1]}>`}</span>
                    <span className="object">
                      &nbsp;
                      {`<${triple[2]}>`}
                    </span>
                    &nbsp;.
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </>
    ),
    [
      classDetail.rhs,
      dispatch,
      focusingURI,
      handleClickRightHandSideClasses,
      intl,
      showRightHand,
      getPreferredTriple,
    ]
  )

  const objectElement = useMemo(
    () => (
      <>
        <h3 className={`relation-header${showLeftHand ? ' open' : ''}`}>
          <button type="button" onClick={handleClickLeftHandSideClasses}>
            {intl.formatMessage({
              id: 'classRelationsDetail.triple.with.this.class.as.object',
            })}
            <span className="open-toggle" />
          </button>
        </h3>
        {showLeftHand && classDetail.lhs && (
          <ul className="triples">
            {classDetail.lhs.map((lhs, index) => {
              const relationClass = (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                e.preventDefault()
                dispatch(DetailAction.showRelation(lhs))
              }
              const triple = [lhs[0], lhs[1], focusingURI || '']
              return (
                <li key={index}>
                  <button
                    type="button"
                    title={getPreferredTriple(triple)}
                    onClick={relationClass}
                  >
                    <span className="subject">
                      {`<${triple[0]}>`}
                      &nbsp;
                    </span>
                    <span>{`<${triple[1]}>`}</span>
                    <span className="focusing">
                      &nbsp;
                      {`<${triple[2]}>`}
                    </span>
                    &nbsp;.
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </>
    ),
    [
      classDetail.lhs,
      dispatch,
      focusingURI,
      handleClickLeftHandSideClasses,
      intl,
      showLeftHand,
      getPreferredTriple,
    ]
  )

  return (
    <div className="section">
      {headerElement}
      {subjectElement}
      {objectElement}
    </div>
  )
}

ClassRelationsDetail.displayName = 'ClassRelationsDetail'
ClassRelationsDetail.defaultProps = { fromPropertySelection: false }

export default ClassRelationsDetail
