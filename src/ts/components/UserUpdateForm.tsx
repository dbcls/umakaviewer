import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { reduxForm, InjectedFormProps, Field } from 'redux-form'

import { FormAttributes } from '../constants'
import { UserFormData } from '../actions/user'
import { renderTextField, ValidationError } from './form-fields'

const validate = (values: UserFormData) => {
  const error: ValidationError = {}

  const displayMaxLength = FormAttributes.UserUpdate.DISPLAY_NAME_MAX_LENGTH
  if (values.display_name && values.display_name.length > displayMaxLength) {
    error.display_name = (
      <FormattedMessage
        id="userUpdateForm.maxLengthDisplayName"
        values={{ max: displayMaxLength }}
      />
    )
  }

  const contactUriMaxLength = FormAttributes.UserUpdate.CONTACT_URI_MAX_LENGTH
  if (values.contact_uri && values.contact_uri.length > contactUriMaxLength) {
    error.contact_uri = (
      <FormattedMessage
        id="userUpdateForm.maxLengthContactUri"
        values={{ max: contactUriMaxLength }}
      />
    )
  }

  return error
}

interface Props {}

const UserUpdateForm: React.SFC<InjectedFormProps<any, Props> & Props> = (
  props
) => {
  const { handleSubmit, submitting, invalid, error } = props

  let errorMessage
  if (error) {
    errorMessage = <p className="setting-form__errormessage">{error}</p>
  }

  const buttonClassName =
    invalid || submitting
      ? 'setting-form__button setting-form__button--before'
      : 'setting-form__button'

  return (
    <section className="setting-form">
      <form>
        {errorMessage}
        <FormattedMessage id="userUpdateForm.displayNameLabel">
          {(label: string) => (
            <Field
              name="display_name"
              component={renderTextField}
              label={label}
            />
          )}
        </FormattedMessage>
        <FormattedMessage id="userUpdateForm.contactUriLabel">
          {(label: string) => (
            <Field
              name="contact_uri"
              component={renderTextField}
              label={label}
            />
          )}
        </FormattedMessage>

        <button
          type="submit"
          className={buttonClassName}
          disabled={invalid || submitting}
          onClick={handleSubmit}
        >
          <FormattedMessage id="userUpdateForm.buttonUpdate" />
        </button>
      </form>
    </section>
  )
}

export default reduxForm<any, Props>({
  form: FormAttributes.UserUpdate.NAME,
  validate,
})(UserUpdateForm)
