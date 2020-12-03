import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import {
  UserDeleteState,
  CloseDeleteModalAction,
  UserDeleteAction,
  DeleteModalStates,
} from '../actions/user'

interface Props {
  userDelete: UserDeleteState
  actions: {
    closeDeleteModal: () => CloseDeleteModalAction
    deleteUser: () => UserDeleteAction
  }
}

export default class UserDeleteModal extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onClickCloseButton = this.onClickCloseButton.bind(this)
    this.onClickDeleteButton = this.onClickDeleteButton.bind(this)
  }

  private onClickCloseButton(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { actions } = this.props
    actions.closeDeleteModal()
  }

  private onClickDeleteButton(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { actions } = this.props
    actions.deleteUser()
  }

  private renderOpen() {
    return (
      <>
        <div className="overlayCol-wall" />
        <div className="overlayCol setting-account">
          <h2>
            <FormattedMessage id="userDeleteModal.h2" />
          </h2>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="overlayCol__btn-close"
          >
            <span>close</span>
          </a>
          <p>
            <FormattedMessage id="userDeleteModal.confirm" />
          </p>
          <div className="setting-account__btnbox">
            <a
              onClick={this.onClickDeleteButton}
              href="/"
              className="setting-account__btnbox--delete"
            >
              <FormattedMessage id="userDeleteModal.buttonDelete" />
            </a>
            <a
              onClick={this.onClickCloseButton}
              href="/"
              className="setting-account__btnbox--cancel"
            >
              <FormattedMessage id="userDeleteModal.buttonCancel" />
            </a>
          </div>
        </div>
      </>
    )
  }

  render() {
    const { userDelete } = this.props
    switch (userDelete.modal) {
      case DeleteModalStates.CLOSE:
        return null
      case DeleteModalStates.OPEN:
        return this.renderOpen()
      default:
        return null
    }
  }
}
