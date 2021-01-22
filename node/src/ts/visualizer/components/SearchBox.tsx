import _ from 'lodash'
import React, { useCallback, useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Classes } from '../types/class'
import { RootState } from '../reducers'
import { SearchAction } from '../actions/search'
import SearchCandidate from './SearchCandidate'

type SearchBoxProps = {
  classes: Classes
}

const selector = ({ search: { selected, candidates } }: RootState) => ({
  selected,
  candidates,
})

const SearchBox: React.FC<SearchBoxProps> = (props) => {
  const { classes } = props
  const dispatch = useDispatch()
  const intl = useIntl()
  const { selected, candidates } = useSelector(selector)

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const updateQuery = useCallback(
    (query: string, interval = 0.2) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        dispatch(SearchAction.updateQuery(query, classes))
      }, interval * 1000)
    },
    [classes, dispatch]
  )

  const searchBoxRef = useRef<HTMLDivElement>(null)
  const textboxRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    // タグに直接onClickを指定すると発火順がおかしくなる...
    document.body.addEventListener('click', () => {
      dispatch(SearchAction.hideCandidate())
    })
    searchBoxRef.current?.addEventListener('click', () => {
      _.method('stopPropagation')
    })
    textboxRef.current?.addEventListener('click', (event: MouseEvent) => {
      const { target } = event
      if (target instanceof HTMLInputElement) {
        updateQuery(target.value, 0)
      }
    })
    textboxRef.current?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mounted = useRef(false)
  const candidatesRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    // Make selected candidate visible by scrolling
    if (mounted.current) {
      const candidatesRect = candidatesRef.current?.getBoundingClientRect()
      const textboxRect = textboxRef.current?.getBoundingClientRect()
      const selectedRect = document
        .getElementById('selected')
        ?.getBoundingClientRect()

      if (
        candidatesRef.current &&
        candidatesRect &&
        textboxRect &&
        selectedRect
      ) {
        if (selectedRect.top < candidatesRect.top) {
          // when press up
          candidatesRef.current.scrollTop +=
            selectedRect.top - textboxRect.bottom
        } else if (candidatesRect.bottom < selectedRect.bottom) {
          // when press down
          candidatesRef.current.scrollTop +=
            selectedRect.bottom - textboxRect.bottom - candidatesRect.height
        }
      }
    } else {
      mounted.current = true
    }
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'Tab':
          event.preventDefault() // タブキーでフォーカスを移さない
          break
        case 'ArrowUp':
          dispatch(SearchAction.prevCandidate())
          break
        case 'ArrowDown':
          dispatch(SearchAction.nextCandidate())
          break
        default:
          break
      }
    },
    [dispatch]
  )

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter' && !event.key.startsWith('Arrow')) {
        updateQuery(event.currentTarget.value) // 削除などの特殊キーはKeyPressを発火させない
      }
    },
    [updateQuery]
  )

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // IMEが有効な間は呼ばれない
      if (event.key === 'Enter') {
        if (candidates.length && selected !== null) {
          dispatch(SearchAction.confirmCandidate(candidates[selected].uri))
        } else {
          updateQuery(event.currentTarget.value, 0)
        }
      }
    },
    [dispatch, candidates, selected, updateQuery]
  )

  const focus = useCallback(() => {
    // http://stackoverflow.com/a/11676673
    const { scrollX, scrollY } = window
    // textboxRef.current?.focus()
    window.scrollTo(scrollX, scrollY)
  }, [])

  return (
    <div id="search" ref={searchBoxRef}>
      <input
        ref={textboxRef}
        type="search"
        placeholder={intl.formatMessage({
          id: 'searchBox.input.placeholder.search',
        })}
        onKeyDown={handleKeyDown}
        onKeyPress={handleKeyPress}
        onKeyUp={handleKeyUp}
        onBlur={focus}
      />
      <img src="/static/images/icon-search.png" alt="search-icon" />
      <ul ref={candidatesRef}>
        {candidates.map((candidate, idx) => (
          <SearchCandidate
            key={`component-searchbox-list-candicate-${idx}`}
            selected={selected}
            index={idx}
            candidate={candidate}
          />
        ))}
      </ul>
    </div>
  )
}

export default SearchBox
