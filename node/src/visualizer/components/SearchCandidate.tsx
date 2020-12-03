import React, { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { SearchAction } from '../actions/search'
import { Candidate } from '../reducers/search'

type SearchCandidateProps = {
  selected: number | null
  index: number
  candidate: Candidate
}

const SearchCandidate: React.FC<SearchCandidateProps> = (props) => {
  const {
    selected,
    index,
    candidate: { uri, label, language, entities },
  } = props
  const dispatch = useDispatch()

  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    ref.current?.addEventListener('click', () => {
      dispatch(SearchAction.confirmCandidate(uri))
    })
  }, [dispatch, uri])

  const handleHover = useCallback(() => {
    dispatch(SearchAction.selectCandidate(index))
  }, [dispatch, index])

  return (
    <li
      ref={ref}
      id={index === selected ? 'selected' : ''}
      onMouseOver={handleHover}
      onFocus={() => false}
    >
      <dl>
        <div>
          <dt>[URI]</dt>
          <dd>{uri}</dd>
        </div>
        <div>
          <dt>[label]</dt>
          <dd>
            <span>
              {label}
              {language ? `(${language})` : null}
            </span>
            <span className="triple-count">{entities}</span>
          </dd>
        </div>
      </dl>
    </li>
  )
}

export default SearchCandidate
