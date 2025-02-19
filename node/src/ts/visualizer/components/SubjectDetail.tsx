import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { SearchAction } from '../actions/search'
import { Classes } from '../types/class'
import { getLabels, getPreferredLabel } from '../utils/label'

type SubjectDetailProps = {
  classes: Classes
  uri: string | null
}

const SubjectDetail: React.FC<SubjectDetailProps> = (props) => {
  const { classes, uri } = props
  const dispatch = useDispatch()
  const intl = useIntl()
  const labels = getLabels()

  const classDetail = useMemo(() => {
    return classes[uri || '']
  }, [classes, uri])

  const label = useMemo(() => {
    return labels?.[uri || ''] ?? classDetail?.label
  }, [classes, uri])

  return (
    <>
      {label && (
        <div className="subject">
          <h4>rdfs:label</h4>
          <ul>
            {Object.keys(label)
              .sort()
              .reverse()
              .map((lang, idx) => (
                <li key={`component-subjectdetail-list-label-${idx}`}>
                  →&nbsp;
                  <span className="object">{label[lang]}</span>
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
                    title={getPreferredLabel(superClass, intl.locale, classes)}
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
