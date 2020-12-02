import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { reduxForm, InjectedFormProps } from 'redux-form'

import { FormAttributes } from '../constants'

interface Props {}

const UserDeleteForm: React.SFC<InjectedFormProps<any, Props> & Props> = (
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
        <button
          type="submit"
          className={buttonClassName}
          disabled={invalid || submitting}
          onClick={handleSubmit}
        >
          <FormattedMessage id="userDeleteForm.buttonDelete" />
        </button>
      </form>
    </section>
  )
}

export default reduxForm<any, Props>({
  form: FormAttributes.UserDelete.NAME,
})(UserDeleteForm)
