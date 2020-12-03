import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { SearchAction } from '../actions/search'
import { ClassDetail } from '../types/class'

type SubjectDetailProps = {
  classDetail: ClassDetail | undefined
}

const SubjectDetail: React.FC<SubjectDetailProps> = (props) => {
  const { classDetail } = props
  const dispatch = useDispatch()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const uri = e.currentTarget.textContent
      dispatch(SearchAction.confirmCandidate(uri))
    },
    [dispatch]
  )

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
            {classDetail.subClassOf.map((uri, idx) => (
              <li key={`component-subjectdetail-list-subclassof-${idx}`}>
                →&nbsp;
                <button type="button" className="object" onClick={handleClick}>
                  {uri}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default SubjectDetail
