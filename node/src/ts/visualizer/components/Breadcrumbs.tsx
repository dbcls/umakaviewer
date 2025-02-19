import _ from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { DetailAction } from '../actions/detail'
import { RootState } from '../reducers'
import { Classes } from '../types/class'
import { flattenParents } from '../utils/node'
import GraphRepository from '../utils/GraphRepository'
import { getPreferredLabel } from '../utils/label'

type BreadcrumbsProps = {
  classes: Classes
}

const selector = ({
  detail: { focusingURI, focusingCircleKey },
}: RootState) => ({ focusingURI, focusingCircleKey })

const Breadcrumbs: React.FC<BreadcrumbsProps> = (props) => {
  const { classes } = props
  const { focusingURI, focusingCircleKey } = useSelector(selector)
  const dispath = useDispatch()
  const intl = useIntl()

  const mounted = useRef(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (mounted.current) {
      if (ref.current) {
        ref.current.scrollLeft = ref.current.getBoundingClientRect().width
      }
    } else {
      mounted.current = true
    }
  }, [])

  let breadcrumbs: React.ReactNode[] = []
  if (GraphRepository.nodes && focusingURI && focusingCircleKey) {
    const focusingCircle = GraphRepository.findKeyNode(focusingCircleKey)

    if (focusingCircle) {
      breadcrumbs = _.flatMap(
        _.tail(flattenParents(focusingCircle)),
        (breadcrumb, i) => [
          <button
            type="button"
            key={breadcrumb.data.uri}
            onClick={() => {
              dispath(
                DetailAction.focusCircle(
                  breadcrumb.data.key,
                  breadcrumb.data.uri
                )
              )
            }}
            onKeyDown={() => false}
          >
            {getPreferredLabel(breadcrumb.data.uri, intl.locale, classes)}
          </button>,
          <span key={i}>&gt;</span>,
        ]
      )
    }
  }

  return (
    <section
      className="breadcrumbs"
      style={{ display: breadcrumbs.length === 0 ? 'none' : 'block' }}
    >
      {breadcrumbs}
    </section>
  )
}

export default Breadcrumbs
