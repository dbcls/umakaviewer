/* eslint-disable camelcase */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IntlProvider } from 'react-intl'

import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/ja'
import '@formatjs/intl-pluralrules/locale-data/en'

import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/ja'
import '@formatjs/intl-relativetimeformat/locale-data/en'

import {
  Provider as ReduxProvider,
  useDispatch,
  useSelector,
} from 'react-redux'
import _ from 'lodash'
import { useHistory } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import { getLocaleMessages, getLocaleShortString, useQuery } from './utils'
import { Structure } from './types/structure'
import { Metadata } from './types/metadata'
import Prefix from './components/Prefix'
import Tooltip from './components/Tooltip'
import SearchBox from './components/SearchBox'
import PropertyList from './components/PropertyList'
import Blacklist from './utils/BlackList'
import Detail from './components/Detail'
import Graph from './components/Graph'

import configureStore from './store/store'
import ApiClient from '../ApiClient'
import { useDBCLSFooter } from '../useDBCLSFooter'
import { RootState } from './reducers'
import { FilterAction } from './actions/filter'
import { flattenStructure } from './utils/node'
import { AppState, Content } from './types'
import { setLabels } from './utils/label'

const initialAppState: AppState = {
  structure: [],
  classes: {},
  properties: [],
  prefixes: {},
  labels: {},
}

const filterStateDestructive = (
  state: AppState,
  condition: (uri: string) => boolean
) => {
  const { structure, classes, properties } = state

  const filterStructure = (children: Structure[]) => {
    const childSet = new Set(children)
    childSet.forEach((node) => {
      if (condition(node.uri)) {
        childSet.delete(node)
      } else if (node.children !== undefined) {
        // eslint-disable-next-line no-param-reassign
        node.children = filterStructure(node.children)
      }
    })
    return Array.from(childSet)
  }
  // eslint-disable-next-line no-param-reassign
  state.structure = filterStructure(structure)

  Object.keys(classes).forEach((key) => {
    if (condition(key)) {
      // eslint-disable-next-line no-param-reassign
      delete classes[key]
    }
  })

  properties.forEach((property) => {
    const { class_relations: relations } = property
    const relationSet = new Set(relations)
    relationSet.forEach((relation) => {
      const { subject_class: s, object_class: o } = relation
      if ((s && condition(s)) || (o && condition(o))) {
        relationSet.delete(relation)
      }
    })
    // eslint-disable-next-line no-param-reassign
    property.class_relations = Array.from(relationSet)
  })
}

const isEmptyState = (state: AppState) => {
  if (
    state.structure.length === 0 &&
    state.properties.length === 0 &&
    Object.keys(state.classes).length === 0 &&
    Object.keys(state.prefixes).length === 0
  ) {
    return true
  }
  return false
}

type AppProps = {
  content: Content
}

const selector = ({ filter: { lowerLimitOfClassEntities } }: RootState) => ({
  lowerLimitOfClassEntities,
})

const App: React.FC<AppProps> = (props) => {
  const { content } = props
  const dispatch = useDispatch()
  const query = useQuery()
  const history = useHistory()

  const [rawState, setRawState] = useState<AppState>(initialAppState)
  const [state, setState] = useState<AppState>(initialAppState)
  const [metadata, setMetadata] = useState<Metadata | null>(null)

  const getReferenceURL = useCallback(
    (uri: string | null) => {
      if (uri === null) {
        return null
      }

      if (uri && !uri.startsWith('http')) {
        const parts = uri.split(':', 2)
        return state.prefixes[parts[0]] + parts[1]
      }
      return uri
    },
    [state.prefixes]
  )

  useEffect(() => {
    const nextState = {
      structure: content.inheritance_structure,
      classes: content.classes,
      properties: content.properties,
      prefixes: content.prefixes,
      labels: content.labels,
    }

    if (isEmptyState(nextState) || !isEmptyState(rawState)) {
      return
    }

    const entitiesLowerLimit = Number(query.get('lower_limit'))
    if (Number.isInteger(entitiesLowerLimit)) {
      dispatch(FilterAction.filterClasses(entitiesLowerLimit))
    }

    ApiClient.checkHealthy().then((res) => {
      if (res.data.ok) {
        Blacklist.configre({
          classes: '/static/blacklists/bcl.txt',
          prefixes: '/static/blacklists/bpr.txt',
        })

        const existsInBlacklist = (uri: string) =>
          Blacklist.has(uri, content.prefixes)
        filterStateDestructive(nextState, existsInBlacklist)

        setRawState(nextState)
        setMetadata(content.meta_data)
      }
    })
  }, [content, rawState]) // eslint-disable-line react-hooks/exhaustive-deps

  const { lowerLimitOfClassEntities } = useSelector(selector)
  useEffect(() => {
    if (isEmptyState(rawState)) {
      return
    }

    if (lowerLimitOfClassEntities <= 1) {
      history.push({
        pathname: history.location.pathname,
      })
      setState(rawState)
      return
    }

    history.push({
      pathname: history.location.pathname,
      search: `?lower_limit=${lowerLimitOfClassEntities}`,
    })

    const urisToHide = rawState.structure
      .flatMap((e) => flattenStructure(e))
      .filter((e) => {
        const detail = rawState.classes[e.uri]
        const hasNoChildren = e.children === undefined
        const entityUndefined = !detail || detail.entities === undefined
        const lessThanLimit = (detail.entities ?? 0) < lowerLimitOfClassEntities
        return hasNoChildren && (entityUndefined || lessThanLimit)
      })
      .reduce((prev, cur) => prev.add(cur.uri), new Set<string>())

    const shouldHideElement = (uri: string) => urisToHide.has(uri)
    const nextState = _.cloneDeep(rawState)
    filterStateDestructive(nextState, shouldHideElement)
    setState(nextState)
  }, [rawState, lowerLimitOfClassEntities])

  const { structure, classes, properties, prefixes, labels } = state
  setLabels(labels)
  return (
    <div id="main">
      <PropertyList properties={properties} />
      <Graph
        classes={classes}
        structure={structure}
        metadata={metadata}
        getReferenceURL={getReferenceURL}
      />
      <Detail classes={classes} getReferenceURL={getReferenceURL} />
      <div id="header-right">
        <SearchBox classes={classes} />
        <Prefix prefixes={prefixes} />
      </div>
      <Tooltip classes={classes} />
      <ReactTooltip place="bottom" />
    </div>
  )
}

App.displayName = 'App'

const store = configureStore()
const Visualizer: React.FC<AppProps> = (props) => {
  const { content } = props
  const [locale, setLocale] = useState('en')
  const [messages, setMessages] = useState<{ [key: string]: string }>(
    getLocaleMessages('en')
  )
  const { copyElement } = useDBCLSFooter()

  useEffect(() => {
    const localeShortString = getLocaleShortString()
    setLocale(localeShortString)
    setMessages(getLocaleMessages(localeShortString))
  }, [])

  const footerElement = useMemo(() => {
    return (
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: copyElement ? copyElement.outerHTML : '',
        }}
      />
    )
  }, [copyElement])

  return (
    <ReduxProvider store={store}>
      <IntlProvider locale={locale} messages={messages}>
        <App content={content} />
        {footerElement}
      </IntlProvider>
    </ReduxProvider>
  )
}

export default Visualizer
