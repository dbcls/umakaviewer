import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import {
  CurrentUser,
  UserFormData,
  SubmitUserAttributesAction,
} from '../actions/user'
import UserUpdateForm from './UserUpdateForm'

interface Props {
  user: CurrentUser
  actions: {
    submitUserAttributes: (user: UserFormData) => SubmitUserAttributesAction
  }
}

export default class UserUpdate extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }

  private onSubmit(user: UserFormData) {
    const { actions } = this.props
    actions.submitUserAttributes(user)
  }

  render() {
    const { user } = this.props
    if (!user) {
      return null
    }

    const initialValues = { ...user }
    return (
      <>
        <h2>
          <FormattedMessage id="userUpdate.h2" />
        </h2>
        <UserUpdateForm
          enableReinitialize
          initialValues={initialValues}
          onSubmit={this.onSubmit}
        />
      </>
    )
  }
}
