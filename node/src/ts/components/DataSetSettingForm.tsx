import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { reduxForm, InjectedFormProps, Field } from 'redux-form'

import { FormAttributes } from '../constants'
import { UpdatedDataSetSetting } from '../actions/data-set-setting'
import {
  renderPublicToggle,
  renderCommaSeparatedTagName,
  ValidationError,
} from './form-fields'

const validate = (values: UpdatedDataSetSetting) => {
  const error: ValidationError = {}

  if (values.comma_separated_tag_name) {
    const tags = values.comma_separated_tag_name.split(',')
    const maxCount = FormAttributes.DataSetSetting.Tag.MAX_COUNT
    if (tags.length > maxCount) {
      error.comma_separated_tag_name = (
        <FormattedMessage
          id="dataSetSettingForm.maxTagCount"
          values={{ maxCount }}
        />
      )
    } else {
      const maxLength = FormAttributes.DataSetSetting.Tag.NAME_MAX_LENGTH
      const minLength = FormAttributes.DataSetSetting.Tag.NAME_MIN_LENGTH
      tags.forEach((t) => {
        if (t.length > maxLength) {
          error.comma_separated_tag_name = (
            <FormattedMessage
              id="dataSetSettingForm.maxTagNameLength"
              values={{ maxLength }}
            />
          )
        } else if (t.length < minLength) {
          error.comma_separated_tag_name = (
            <FormattedMessage
              id="dataSetSettingForm.minTagNameLength"
              values={{ minLength }}
            />
          )
        }
      })
    }
  }

  return error
}

interface Props {}

const DataSettingForm: React.SFC<InjectedFormProps<any, Props> & Props> = (
  props
) => {
  const { handleSubmit, submitting, invalid, error } = props

  let errorMessage
  if (error) {
    errorMessage = <p>{error}</p>
  }

  const buttonClassName = invalid || submitting ? 'disabled-button' : ''
  return (
    <section className="dataset-setting-form-Col">
      <form className="dataset-setting-form">
        {errorMessage}
        <Field name="is_public" component={renderPublicToggle} />
        <Field
          name="comma_separated_tag_name"
          component={renderCommaSeparatedTagName}
        />
        <button
          type="submit"
          className={buttonClassName}
          disabled={invalid || submitting}
          onClick={handleSubmit}
        >
          <FormattedMessage id="dataSetSettingForm.buttonUpdate" />
        </button>
      </form>
    </section>
  )
}

export default reduxForm<any, Props>({
  form: FormAttributes.DataSetSetting.NAME,
  validate,
})(DataSettingForm)
