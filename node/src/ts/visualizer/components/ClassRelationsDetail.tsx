import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { RootState } from '../reducers'
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

const selector = ({ detail: { showingRelation } }: RootState) => ({
  showingRelation,
})

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
  const { showingRelation } = useSelector(selector)

  const getPreferredTriple = useCallback(
    (triple: string[]) => {
      if (triple.length < 3) {
        return '<><><>'
      }
      const subject = getPreferredLabel(triple[0], classes, intl.locale)
      const predicate = getPreferredLabel(triple[1], classes, intl.locale)
      const object =
        getPreferredLabel(triple[2], classes, intl.locale) ??
        intl.formatMessage({ id: 'detail.no.object' })
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
              const triple = [
                focusingURI || '',
                rhs[0],
                rhs[1] ?? intl.formatMessage({ id: 'detail.no.object' }),
              ]
              return (
                <li key={`component-classrelationdetail-list-rhs-${index}`}>
                  <button
                    type="button"
                    title={getPreferredTriple(triple)}
                    onClick={relationClass}
                    style={{
                      backgroundColor:
                        showingRelation === rhs
                          ? 'rgba(170, 170, 170, 0.5)'
                          : undefined,
                    }}
                  >
                    <span className="focusing">
                      {`<${triple[0]}>`}
                      &nbsp;
                    </span>
                    <span>{`<${triple[1]}>`}</span>
                    <span className={rhs[1] ? 'object' : 'no-object'}>
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
      classDetail,
      dispatch,
      focusingURI,
      handleClickRightHandSideClasses,
      intl,
      showRightHand,
      getPreferredTriple,
      showingRelation,
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
                    style={{
                      backgroundColor:
                        showingRelation === lhs
                          ? 'rgba(170, 170, 170, 0.5)'
                          : undefined,
                    }}
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
      classDetail,
      dispatch,
      focusingURI,
      handleClickLeftHandSideClasses,
      intl,
      showLeftHand,
      getPreferredTriple,
      showingRelation,
    ]
  )
  if (!classDetail) {
    return null
  }
  return (
    <div className="section">
      {headerElement}
      <h4>
        {intl.formatMessage({
          id: 'classRelationsDetail.triple.with.this.class.as.triple',
        })}
      </h4>
      {subjectElement}
      {objectElement}
    </div>
  )
}

ClassRelationsDetail.displayName = 'ClassRelationsDetail'
ClassRelationsDetail.defaultProps = { fromPropertySelection: false }

export default ClassRelationsDetail
