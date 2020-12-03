import React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { ClassDetail } from '../types/class'
import { RootState } from '../reducers'
import ClassRelationsDetail from './ClassRelationsDetail'
import SubjectDetail from './SubjectDetail'

type FocusClassDetailProps = {
  classDetail: ClassDetail
  referenceURL: string | null
}

const selector = ({
  detail: { focusingURI, showLeftHand, showRightHand },
}: RootState) => ({
  focusingURI,
  showLeftHand,
  showRightHand,
})

const FocusClassDetail: React.FC<FocusClassDetailProps> = (props) => {
  const { classDetail, referenceURL } = props
  const { focusingURI, showLeftHand, showRightHand } = useSelector(selector)
  const intl = useIntl()

  if (!focusingURI) {
    return null
  }

  return (
    <div>
      <div className="section">
        <h2>
          {intl.formatMessage({ id: 'focusClassDetail.class.selecting' })}
        </h2>
        <a href={referenceURL || '#'} target="_blank" rel="noopener noreferrer">
          {focusingURI}
        </a>
        <SubjectDetail classDetail={classDetail} />
      </div>
      <ClassRelationsDetail
        title={intl.formatMessage({ id: 'classRelationsDetail.class.relates' })}
        focusingURI={focusingURI}
        showLeftHand={showLeftHand}
        showRightHand={showRightHand}
        classDetail={classDetail}
      />
    </div>
  )
}

FocusClassDetail.displayName = 'FocusClassDetail'

export default FocusClassDetail
