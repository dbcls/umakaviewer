import * as React from 'react'
import { reduxForm, InjectedFormProps } from 'redux-form'

import { FormAttributes } from '../constants'

interface Props {}

const SingUpForm: React.SFC<InjectedFormProps<any, Props> & Props> = (
  props
) => {
  const { handleSubmit, submitting, invalid, error } = props

  let errorMessage
  if (error) {
    errorMessage = <p className="loginform__errormessage">{error}</p>
  }

  const buttonClassName =
    invalid || submitting ? 'loginform__button--before' : ''
  return (
    <section className="loginform-Col">
      <form id="display-create-form" className="loginform">
        {errorMessage}
        <button
          type="submit"
          className={buttonClassName}
          disabled={invalid || submitting}
          onClick={handleSubmit}
        />
      </form>
    </section>
  )
}

export default reduxForm<any, Props>({
  form: FormAttributes.SignUp.NAME,
})(SingUpForm)
