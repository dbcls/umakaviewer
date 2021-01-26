/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react'
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
  { structure, classes, properties, prefixes }: AppState,
  condition: (uri: string) => boolean
): AppState => {
  const filterStructure = (children: Structure[]) => {
    for (let i = 0; i < children.length; i += 1) {
      const node = children[i]
      if (condition(node.uri)) {
        children.splice(i, 1)
        i -= 1
      } else if (node.children !== undefined) {
        filterStructure(node.children)
      }
    }
  }
  filterStructure(structure)

  const filteredClasses = Object.entries(classes).reduce<Classes>(
    (prev, [key, val]) => {
      if (condition(key)) {
        return prev
      }
      prev[key] = val // eslint-disable-line no-param-reassign
      return prev
    },
    {}
  )

  properties.forEach(({ class_relations: relations }) => {
    for (let i = 0; i < relations.length; i += 1) {
      const { subject_class: s, object_class: o } = relations[i]
      if ((s && condition(s)) || (o && condition(o))) {
        relations.splice(i, 1)
        i -= 1
      }
    }
  })

  return {
    structure,
    classes: filteredClasses,
    properties,
    prefixes,
  }
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
  const [locale, setLocale] = useState('ja')
  const [messages, setMessages] = useState<{ [key: string]: string }>(
    getLocaleMessages('ja')
  )
  const footer = useDBCLSFooterOuterText()
  const dispatch = useDispatch()
  const query = useQuery()

  const [state, setState] = useState<AppState>(initialAppState)
  const [stateToDraw, setStateToDraw] = useState<AppState>(initialAppState)

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
    // set locale/messages
    const localeShortString = getLocaleShortString()
    setLocale(localeShortString)
    setMessages(getLocaleMessages(localeShortString))

    const entitiesLimit = Number(query.get('limit'))
    if (Number.isInteger(entitiesLimit)) {
      dispatch(FilterAction.filterClasses(entitiesLimit))
    }

    ApiClient.checkHealthy().then((res) => {
      if (res.data.ok) {
        // set content
        const preferredContent = {
          structure: content.inheritance_structure,
          classes: content.classes,
          properties: content.properties,
          prefixes: content.prefixes,
        }

        // set blacklist
        Blacklist.configre({
          classes: '/static/blacklists/bcl.txt',
          prefixes: '/static/blacklists/bpr.txt',
        })

        // filter content
        const existsInBlacklist = (uri: string) =>
          Blacklist.has(uri, preferredContent.prefixes)
        const filteredContent = filterContent(
          preferredContent,
          existsInBlacklist
        )
        setState(filteredContent)
        setStateToDraw(filteredContent)
      }
    })
  }, [content, footer]) // eslint-disable-line react-hooks/exhaustive-deps

  const restrictNoChildClass = true
  const { lowerLimitOfClassEntities } = useSelector(selector)
  useEffect(() => {
    if (lowerLimitOfClassEntities === 0) {
      setStateToDraw(state)
      return
    }

    const flattenChildren = (elem: Structure): Structure[] => {
      if (elem.children === undefined) {
        return [elem]
      }
      return _.flatMap(elem.children, flattenChildren).concat([elem])
    }

    const urisToFilter = state.structure
      .flatMap((elem) => flattenChildren(elem))
      .filter((elem) => !restrictNoChildClass || !elem.children)
      .map((elem) => elem.uri)
    const urisToHide = urisToFilter.filter((uri) => {
      const { entities } = state.classes[uri]
      return entities === undefined || entities < lowerLimitOfClassEntities
    })

    const shouldHideElement = (uri: string) => urisToHide.includes(uri)
    const filteredState = filterContent(_.cloneDeep(state), shouldHideElement)
    setStateToDraw(filteredState)
  }, [state, lowerLimitOfClassEntities])

  return (
    <IntlProvider locale={locale} messages={messages}>
      <>
        <div id="main">
          <PropertyList properties={stateToDraw.properties} />
          <Graph
            classes={stateToDraw.classes}
            structure={stateToDraw.structure}
          />
          <Detail
            classes={stateToDraw.classes}
            getReferenceURL={getReferenceURL}
          />
          <div id="header-right">
            <SearchBox classes={stateToDraw.classes} />
            <Prefix prefixes={stateToDraw.prefixes} />
          </div>
          <Tooltip classes={stateToDraw.classes} />
        </div>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: footer }}
        />
      </>
    </IntlProvider>
  )
}

App.displayName = 'App'

const store = configureStore()
const Visualizer: React.FC<AppProps> = (props) => {
  const { content } = props
  return (
    <ReduxProvider store={store}>
      <App content={content} />
    </ReduxProvider>
  )
}

export default Visualizer
