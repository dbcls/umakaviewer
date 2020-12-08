/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'

import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/ja'
import '@formatjs/intl-pluralrules/locale-data/en'

import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/ja'
import '@formatjs/intl-relativetimeformat/locale-data/en'

import { Provider as ReduxProvider } from 'react-redux'
import { getLocaleMessages, getLocaleShortString } from './utils'
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

declare global {
  interface Document {
    documentMode?: number
  }

  interface Navigator {
    userLanguage?: string
    browserLanguage?: string
  }
}

const store = configureStore()

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

export type AppState = {
  structure: Structure[]
  classes: Classes
  properties: Property[]
  prefixes: Prefixes
}

const App: React.FC<AppProps> = (props) => {
  const { content } = props
  const [locale, setLocale] = useState('ja')
  const [messages, setMessages] = useState<{ [key: string]: string }>(
    getLocaleMessages('ja')
  )
  const footer = useDBCLSFooterOuterText()

  const [state, setState] = useState<AppState>({
    structure: [],
    classes: {},
    properties: [],
    prefixes: {},
  })

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
    ApiClient.checkHealthy().then((res) => {
      if (res.data.ok) {
        // set content
        const preferedContent = {
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
        const filteredContent = Blacklist.filter(preferedContent)
        setState(filteredContent)
      }
    })
  }, [content, footer]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ReduxProvider store={store}>
      <IntlProvider locale={locale} messages={messages}>
        <>
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
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: footer }}
          />
        </>
      </IntlProvider>
    </ReduxProvider>
  )
}

App.displayName = 'App'

export default App
