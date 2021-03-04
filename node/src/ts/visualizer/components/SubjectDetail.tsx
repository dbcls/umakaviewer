import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { SearchAction } from '../actions/search'
import { Classes } from '../types/class'
import { getPreferredLabel } from '../utils'

type SubjectDetailProps = {
  classes: Classes
  uri: string | null
}

const SubjectDetail: React.FC<SubjectDetailProps> = (props) => {
  const { classes, uri } = props
  const dispatch = useDispatch()
  const intl = useIntl()

  const classDetail = useMemo(() => {
    return classes[uri || '']
  }, [classes, uri])

  return (
    <>
      {classDetail?.label && (
        <div className="subject">
          <h4>rdfs:label</h4>
          <ul>
            {Object.keys(classDetail.label)
              .sort()
              .reverse()
              .map((lang, idx) => (
                <li key={`component-subjectdetail-list-label-${idx}`}>
                  →&nbsp;
                  <span className="object">{classDetail.label?.[lang]}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
      {classDetail?.subClassOf && (
        <div className="subject">
          <h4>rdfs:subClassOf</h4>
          <ul>
            {classDetail.subClassOf.map((superClass, idx) => {
              const handleClick = () => {
                dispatch(SearchAction.confirmCandidate(superClass))
              }
              return (
                <li key={`component-subjectdetail-list-subclassof-${idx}`}>
                  →&nbsp;
                  <button
                    type="button"
                    className="object"
                    title={getPreferredLabel(superClass, classes, intl.locale)}
                    onClick={handleClick}
                  >
                    {superClass}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}

export default SubjectDetail
