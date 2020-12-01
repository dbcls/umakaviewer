import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { ClassDetail } from '../types/class'
import GraphRepository from '../utils/GraphRepository'

type ClassRelationsDetailProps = {
  title: string
  classDetail: ClassDetail
  fromPropertySelection?: boolean
  focusingURI: string | null
  showLeftHand: boolean
  showRightHand: boolean
}

const ClassRelationsDetail: React.FC<ClassRelationsDetailProps> = (props) => {
  const {
    title,
    classDetail,
    fromPropertySelection,
    focusingURI,
    showLeftHand,
    showRightHand,
  } = props
  const dispatch = useDispatch()
  const intl = useIntl()

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
              return (
                <li key={`component-classrelationdetail-list-rhs-${index}`}>
                  <button type="button" onClick={relationClass}>
                    <span className="focusing">
                      {`<${focusingURI}>`}
                      &nbsp;
                    </span>
                    <span>{`<${rhs[0]}>`}</span>
                    <span className="object">
                      &nbsp;
                      {`<${rhs[1]}>`}
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
              return (
                <li key={index}>
                  <button type="button" onClick={relationClass}>
                    <span className="subject">
                      {`<${lhs[0]}>`}
                      &nbsp;
                    </span>
                    <span>{`<${lhs[1]}>`}</span>
                    <span className="focusing">
                      &nbsp;
                      {`<${focusingURI}>`}
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
