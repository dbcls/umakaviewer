import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import clsx from 'clsx'
import { ClassDetail, Classes } from '../types/class'
import { RootState } from '../reducers'
import { UiAction } from '../actions/ui'
import HideableWrapper from './HideableWrapper'
import SubjectDetail from './SubjectDetail'
import { Pattern, SectionType } from '../constants/Detail'
import FocusClassDetail from './FocusClassDetail'
import ClassRelationsDetail from './ClassRelationsDetail'

const wrapperSelector = ({ ui: { detailPaneVisibility } }: RootState) => ({
  detailPaneVisibility,
})
const DetailWrapper: React.FC = ({ children }) => {
  const { detailPaneVisibility } = useSelector(wrapperSelector)
  const dispatch = useDispatch()
  const intl = useIntl()

  const handleToggle = useCallback(() => {
    dispatch(UiAction.hideDetailPane())
  }, [dispatch])

  return (
    <HideableWrapper
      target={intl.formatMessage({ id: 'detail.classDetail.selecting' })}
      visibility={detailPaneVisibility}
      toggleHandler={handleToggle}
      icon="right"
      attrs={{ id: 'class-detail' }}
    >
      {children}
    </HideableWrapper>
  )
}

type DetailSectionProps = {
  sectionType: string
  title: string
  referenceURL: string | null
  uri: string | null
  classDetail: ClassDetail
}
const DetailSection: React.FC<DetailSectionProps> = (props) => {
  const { sectionType, title, referenceURL, uri, classDetail } = props

  return (
    <div
      className={clsx(
        'section',
        { 'both-section': sectionType === SectionType.BOTH },
        { 'subject-section': sectionType === SectionType.DOMAIN },
        { 'object-section': sectionType === SectionType.RANGE }
      )}
    >
      <h2>{title}</h2>
      <a href={referenceURL || '#'} target="_blank" rel="noopener noreferrer">
        {uri}
      </a>
      <SubjectDetail classDetail={classDetail} />
    </div>
  )
}

type DetailProps = {
  classes: Classes
  getReferenceURL: (uri: string | null) => string | null
}
const selector = ({ detail }: RootState) => detail
const Detail: React.FC<DetailProps> = (props) => {
  const { classes, getReferenceURL } = props
  const {
    focusingURI,
    propertyClass: { domain, range },
    showLeftHand,
    showRightHand,
  } = useSelector(selector)
  const intl = useIntl()

  const focusedClassElement = useMemo(() => {
    const classDetail = classes[focusingURI || '']
    return (
      <FocusClassDetail
        classDetail={classDetail}
        referenceURL={getReferenceURL(focusingURI)}
      />
    )
  }, [classes, focusingURI, getReferenceURL])

  const sameDomainRangeElement = useMemo(() => {
    const classDetail = classes[domain || '']
    return (
      <DetailSection
        sectionType={SectionType.BOTH}
        title={intl.formatMessage({ id: 'detail.class.subject.or.object' })}
        referenceURL={getReferenceURL(domain)}
        uri={domain}
        classDetail={classDetail}
      />
    )
  }, [classes, domain, getReferenceURL, intl])

  const differentDomainRangeElement = useMemo(() => {
    const domainClassDetail = classes[domain || '']
    const rangeClassDetail = classes[range || '']
    const canDrawTriple = (node: ClassDetail | undefined) =>
      node?.subClassOf?.length === 1

    return (
      <>
        {domain && (
          <DetailSection
            sectionType={SectionType.DOMAIN}
            title={intl.formatMessage({ id: 'detail.class.subject' })}
            referenceURL={getReferenceURL(domain)}
            uri={domain}
            classDetail={domainClassDetail}
          />
        )}
        {canDrawTriple(domainClassDetail) && (
          <ClassRelationsDetail
            title={intl.formatMessage(
              { id: 'classRelationsDetail.class.relates.of' },
              { target: domain }
            )}
            focusingURI={domain}
            fromPropertySelection
            showLeftHand={domain === focusingURI && showLeftHand}
            showRightHand={domain === focusingURI && showRightHand}
            classDetail={domainClassDetail}
          />
        )}
        {range && (
          <DetailSection
            sectionType={SectionType.RANGE}
            title={intl.formatMessage({ id: 'detail.class.object' })}
            referenceURL={getReferenceURL(range)}
            uri={range}
            classDetail={rangeClassDetail}
          />
        )}
        {canDrawTriple(rangeClassDetail) && (
          <ClassRelationsDetail
            title={intl.formatMessage(
              { id: 'classRelationsDetail.class.relates.of' },
              { target: range }
            )}
            focusingURI={range}
            fromPropertySelection
            showLeftHand={range === focusingURI && showLeftHand}
            showRightHand={range === focusingURI && showRightHand}
            classDetail={rangeClassDetail}
          />
        )}
      </>
    )
  }, [
    classes,
    domain,
    focusingURI,
    getReferenceURL,
    intl,
    range,
    showLeftHand,
    showRightHand,
  ])

  const noneElement = useMemo(() => {
    return (
      <div className="section">
        <h2>{intl.formatMessage({ id: 'detail.class.selecting' })}</h2>
        <p className="no-selected">
          {intl.formatMessage({ id: 'detail.no.selecting.classes' })}
        </p>
      </div>
    )
  }, [intl])

  const detailPattern = useMemo(() => {
    if (domain || range) {
      if (domain === range) {
        return Pattern.SAME_DOMAIN_RANGE
      }
      return Pattern.DIFFERENT_DOMAIN_RANGE
    }
    if (focusingURI) {
      return Pattern.FOCUSED_CLASS
    }
    return Pattern.NONE
  }, [domain, focusingURI, range])

  switch (detailPattern) {
    case Pattern.FOCUSED_CLASS:
      return <DetailWrapper>{focusedClassElement}</DetailWrapper>
    case Pattern.SAME_DOMAIN_RANGE:
      return <DetailWrapper>{sameDomainRangeElement}</DetailWrapper>
    case Pattern.DIFFERENT_DOMAIN_RANGE:
      return <DetailWrapper>{differentDomainRangeElement}</DetailWrapper>
    case Pattern.NONE:
      return <DetailWrapper>{noneElement}</DetailWrapper>
    default:
      return null
  }
}

Detail.displayName = 'Detail'

export default Detail
