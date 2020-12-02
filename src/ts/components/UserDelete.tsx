import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import { OpenDeleteModalAction } from '../actions/user'
import UserDeleteForm from './UserDeleteForm'

interface Props {
  actions: {
    openDeleteModal: () => OpenDeleteModalAction
  }
}

export default class UserDelete extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onClickShowModal = this.onClickShowModal.bind(this)
  }

  private onClickShowModal() {
    const { actions } = this.props
    actions.openDeleteModal()
  }

  render() {
    return (
      <>
        <h2>
          <FormattedMessage id="userDelete.h2" />
        </h2>
        <UserDeleteForm enableReinitialize onSubmit={this.onClickShowModal} />
      </>
    )
  }
}
