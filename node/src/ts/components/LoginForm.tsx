import * as React from 'react'
import { Link } from 'react-router-dom'
import { reduxForm, InjectedFormProps } from 'redux-form'
import { FormattedMessage } from 'react-intl'

import { FormAttributes, Url } from '../constants'

interface Props {}

const LoginForm: React.SFC<InjectedFormProps<any, Props> & Props> = (props) => {
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
        <p className="loginform__createaccount">
          <Link to={Url.SIGN_UP}>
            <FormattedMessage id="login.linkSignUp" />
          </Link>
        </p>
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
  form: FormAttributes.Login.NAME,
})(LoginForm)
