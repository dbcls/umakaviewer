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
import { getLocaleMessages, getLocaleShortString, useQuery } from './utils'
import { Property } from './types/property'
import { Prefixes } from './types/prefix'
import { Classes } from './types/class'
import { Structure } from './types/structure'
import Prefix from './components/Prefix'
import Tooltip from './components/Tooltip'
import SearchBox from './components/SearchBox'
import PropertyList from './components/PropertyList'
import Blacklist from './utils/BlackList'
import Detail from './components/Detail'
import Graph from './components/Graph'

import configureStore from './store/store'
import ApiClient from '../ApiClient'
import { useDBCLSFooterOuterText } from '../useDBCLSFooter'
import { RootState } from './reducers'
import { FilterAction } from './actions/filter'

declare global {
  interface Document {
    documentMode?: number
  }

  interface Navigator {
    userLanguage?: string
    browserLanguage?: string
  }
}

export type AppState = {
  structure: Structure[]
  classes: Classes
  properties: Property[]
  prefixes: Prefixes
}

const initialAppState: AppState = {
  structure: [],
  classes: {},
  properties: [],
  prefixes: {},
}

const filterContent = (
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

const isEmptyContent = (content: AppState) => {
  if (
    content.structure.length === 0 &&
    content.properties.length === 0 &&
    Object.keys(content.classes).length === 0 &&
    Object.keys(content.prefixes).length === 0
  ) {
    return true
  }
  return false
}

export type Content = {
  inheritance_structure: Structure[]
  classes: Classes
  properties: Property[]
  prefixes: Prefixes
  meta_data: any
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

  // utility
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
    const preferredContent = {
      structure: content.inheritance_structure,
      classes: content.classes,
      properties: content.properties,
      prefixes: content.prefixes,
    }

    if (isEmptyContent(preferredContent) || !isEmptyContent(rawState)) {
      return
    }

    const entitiesLowerLimit = Number(query.get('lower_limit'))
    if (Number.isInteger(entitiesLowerLimit)) {
      dispatch(FilterAction.filterClasses(entitiesLowerLimit))
    }

    ApiClient.checkHealthy().then((res) => {
      if (res.data.ok) {
        // set blacklist
        Blacklist.configre({
          classes: '/static/blacklists/bcl.txt',
          prefixes: '/static/blacklists/bpr.txt',
        })

        // filter content
        const existsInBlacklist = (uri: string) =>
          Blacklist.has(uri, preferredContent.prefixes)
        filterContent(preferredContent, existsInBlacklist)
        setRawState(preferredContent)
      }
    })
  }, [content, rawState]) // eslint-disable-line react-hooks/exhaustive-deps

  const { lowerLimitOfClassEntities } = useSelector(selector)
  useEffect(() => {
    if (isEmptyContent(rawState)) {
      return
    }

    if (lowerLimitOfClassEntities === 0) {
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

    const flattenChildren = (elem: Structure): Structure[] => {
      if (elem.children === undefined) {
        return [elem]
      }
      return _.flatMap(elem.children, flattenChildren).concat([elem])
    }

    const urisToHide = rawState.structure
      .flatMap((elem) => flattenChildren(elem))
      .filter((elem) => {
        const classDetail = rawState.classes[elem.uri]
        return (
          elem.children === undefined &&
          (classDetail === undefined ||
            classDetail.entities === undefined ||
            classDetail.entities < lowerLimitOfClassEntities)
        )
      })
      .reduce<{ [key: string]: true }>((prev, cur) => {
        // eslint-disable-next-line no-param-reassign
        prev[cur.uri] = true
        return prev
      }, {})

    const shouldHideElement = (uri: string) => urisToHide[uri]
    const nextState = _.cloneDeep(rawState)
    filterContent(nextState, shouldHideElement)
    setState(nextState)
  }, [rawState, lowerLimitOfClassEntities])

  return (
    <div id="main">
      <PropertyList properties={state.properties} />
      <Graph classes={state.classes} structure={state.structure} />
      <Detail classes={state.classes} getReferenceURL={getReferenceURL} />
      <div id="header-right">
        <SearchBox classes={state.classes} />
        <Prefix prefixes={state.prefixes} />
      </div>
      <Tooltip classes={state.classes} />
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
  const footer = useDBCLSFooterOuterText()

  useEffect(() => {
    const localeShortString = getLocaleShortString()
    setLocale(localeShortString)
    setMessages(getLocaleMessages(localeShortString))
  }, [])

  const footerElement = useMemo(() => {
    console.log(footer)
    // eslint-disable-next-line react/no-danger
    return <div dangerouslySetInnerHTML={{ __html: footer }} />
  }, [footer])

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
