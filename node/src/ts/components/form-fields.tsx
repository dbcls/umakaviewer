import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons'

import { FormAttributes } from '../constants'

export interface ValidationError {
  [key: string]: any
}

export const renderEmailField = ({
  input,
  label,
  meta: { touched, error },
}: any) => {
  let hasError = ''
  if (touched && error) {
    hasError = 'has_error'
  }

  const inputId = `form-field-${label}`
  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input type="email" id={inputId} className={hasError} {...input} />
    </div>
  )
}

export const renderPasswordField = ({
  input,
  label,
  meta: { touched, error },
}: any) => {
  let hasError = ''
  if (touched && error) {
    hasError = 'has_error'
  }

  const inputId = `form-field-${label}`
  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input type="password" id={inputId} className={hasError} {...input} />
    </div>
  )
}

export const renderPublicToggle = ({ input }: any) => {
  // トグルアイコンをクリックしたときにイベントをチェックボックスにも起こす
  const checkboxRef = React.createRef<HTMLInputElement>()
  const onClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()
    if (checkboxRef.current) {
      checkboxRef.current.click()
    }
  }

  const toggleIcon = (
    <span role="presentation" onClick={onClick}>
      <FontAwesomeIcon
        icon={input.value ? faToggleOn : faToggleOff}
        size="2x"
        color="#397dac"
      />
    </span>
  )

  const inputId = 'form-field-public-swith'
  return (
    <div className="public-switch-container">
      <div className="public-switch">
        <label htmlFor={inputId}>
          <FormattedMessage id="formFields.togglePublicLabel" />
        </label>
        {toggleIcon}
        <input
          type="checkbox"
          id={inputId}
          {...input}
          checked={input.value}
          ref={checkboxRef}
        />
      </div>
      <p>
        <FormattedMessage id="formFields.toggleHelpText1" />
        <br />
        <FormattedMessage id="formFields.toggleHelpText2" />
      </p>
    </div>
  )
}

export const renderCommaSeparatedTagName = ({
  input,
  meta: { active, error },
}: any) => {
  let errorMessage
  if (active && error) {
    errorMessage = <p className="commaSeparatedTag__error">{error}</p>
  }

  const inputId = 'form-field-tag-names'
  const maxCount = FormAttributes.DataSetSetting.Tag.MAX_COUNT
  return (
    <div className="tag-container">
      <label htmlFor={inputId}>
        <FormattedMessage id="formFields.tagInputLabel" />
      </label>
      <input type="text" id={inputId} {...input} />
      <p>
        <FormattedMessage
          id="formFields.tagInputHelpText"
          values={{ maxCount }}
        />
      </p>
      {errorMessage}
    </div>
  )
}

export const renderTextField = ({
  input,
  label,
  meta: { touched, error },
}: any) => {
  let hasError = ''
  let errorMessage
  if (touched && error) {
    hasError = 'has_error'
    errorMessage = <p className="setting-form__errormessage">{error}</p>
  }

  const inputId = `form-field-${label}`
  return (
    <div className="setting-field">
      <label htmlFor={inputId}>{label}</label>
      <input type="text" id={inputId} className={hasError} {...input} />
      {errorMessage}
    </div>
  )
}
