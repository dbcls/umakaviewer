import * as React from 'react'

import { SignUpAction } from '../actions/signup'
import SignUpForm from './SignUpForm'
import MultiLineMessage from './MultiLineMessage'

interface Props {
  actions: {
    signUp: () => SignUpAction
  }
}

export default class SignUp extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }

  private onSubmit() {
    const { actions } = this.props
    actions.signUp()
  }

  render() {
    return (
      <>
        <SignUpForm enableReinitialize onSubmit={this.onSubmit} />
        <div className="signUpMessage">
          <MultiLineMessage
            messageIds={['signUp.message1', 'signUp.message2']}
          />
        </div>
      </>
    )
  }
}
