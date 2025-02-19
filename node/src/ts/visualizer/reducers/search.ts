import _ from 'lodash'
import { SearchActionType } from '../actions/search'
import * as types from '../constants/ActionTypes'
import { Classes } from '../types/class'
import { getLabels } from '../utils/label'

export type Candidate = {
  language: string | null
  label: string
  uri: string
  entities: number | undefined
}

export interface SearchState {
  candidates: Candidate[]
  selected: number | null
  query: string | null
}

const initialState: SearchState = {
  candidates: [],
  selected: null,
  query: null,
}

export default function search(
  state = initialState,
  action: SearchActionType
): SearchState {
  switch (action.type) {
    case types.UPDATE_QUERY: {
      const labels = getLabels()
      const getCandidates = (query: string, classes: Classes): Candidate[] => {
        // MeSH等でマッチしたクラスが多すぎると検索窓の描画が重くなるため文字数制限
        const getByteSize = (str: string) =>
          unescape(encodeURIComponent(str)).length
        if (query.trim() === '' || getByteSize(query) < 3) {
          return []
        }

        const isIncludesString = (str: string, searchStr: string) =>
          str.toLowerCase().includes(searchStr.toLowerCase())
        const candidates = Object.keys(classes)
          .map((key) => ({ uri: key, cls: classes[key] }))
          .filter(({ uri, cls }) => {
            const jaLabel = labels?.[uri]?.ja ?? cls.label?.ja
            const enLabel = labels?.[uri]?.en ?? cls.label?.en
            return (
              isIncludesString(uri, query) ||
              (jaLabel && isIncludesString(jaLabel, query)) ||
              (enLabel && isIncludesString(enLabel, query))
            )
          })
          .map(({ uri, cls }) => {
            const candidate: Candidate = {
              language: null,
              label: uri,
              entities: cls.entities,
              uri,
            }

            const jaLabel = labels?.[uri]?.ja ?? cls.label?.ja
            const enLabel = labels?.[uri]?.en ?? cls.label?.en
            if (jaLabel) {
              const preferredLabel = {
                language: 'ja',
                label: jaLabel,
              }
              return {
                ...candidate,
                ...preferredLabel,
              }
            }
            if (enLabel) {
              const preferredLabel = {
                language: 'en',
                label: enLabel,
              }
              return {
                ...candidate,
                ...preferredLabel,
              }
            }
            return candidate
          })

        return _.orderBy(
          candidates,
          ({ entities }) => entities ?? Infinity * -1,
          ['desc']
        )
      }

      const candidates = getCandidates(
        action.payload.query,
        action.payload.classes
      )
      return {
        ...state,
        query: action.payload.query,
        selected: candidates.length === 0 ? null : 0,
        candidates,
      }
    }
    case types.PREV_CANDIDATE: {
      if (state.candidates.length === 0) {
        return state
      }

      let selected
      if (state.selected !== null) {
        if (state.selected === 0) {
          selected = state.candidates.length - 1
        } else {
          selected = state.selected - 1
        }
      } else {
        selected = 0
      }
      return {
        ...state,
        selected,
      }
    }
    case types.NEXT_CANDIDATE: {
      if (state.candidates.length === 0) {
        return state
      }

      let selected
      if (state.selected !== null) {
        if (state.candidates.length - 1 <= state.selected) {
          selected = 0
        } else {
          selected = state.selected + 1
        }
      } else {
        selected = 0
      }

      return {
        ...state,
        selected,
      }
    }
    case types.SELECT_CANDIDATE:
      return {
        ...state,
        selected: action.payload.index,
      }
    case types.CONFIRM_CANDIDATE:
      return {
        ...state,
        candidates: [],
      }
    default:
      return state
  }
}
