import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import {
  DataSetDeleteState,
  CloseModalAction,
  DeleteAction,
  DeleteModalStates,
} from '../actions/data-set-delete'

interface Props {
  dataSetDelete: DataSetDeleteState
  actions: {
    closeModal: () => CloseModalAction
    deleteDataSet: () => DeleteAction
  }
}

export default class DataSetDelete extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)

    this.onClickCloseButton = this.onClickCloseButton.bind(this)
    this.onClickDeleteButton = this.onClickDeleteButton.bind(this)
  }

  private onClickCloseButton(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { actions } = this.props
    actions.closeModal()
  }

  private onClickDeleteButton(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { actions } = this.props
    actions.deleteDataSet()
  }

  private renderOpen() {
    const { dataSetDelete } = this.props
    const title = dataSetDelete.dataSet ? dataSetDelete.dataSet.title : ''
    return (
      <>
        <div className="overlayCol-wall" />
        <div className="overlayCol setting-account">
          <h2>
            <FormattedMessage id="dataSetDelete.headerDelete" />
          </h2>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="overlayCol__btn-close"
          >
            <span>close</span>
          </a>
          <p>
            <FormattedMessage
              id="dataSetDelete.confirm"
              values={{
                title: <span className="title">{title}</span>,
              }}
            />
          </p>
          <div className="setting-account__btnbox">
            <a
              onClick={this.onClickDeleteButton}
              href="/"
              className="setting-account__btnbox--delete"
            >
              <FormattedMessage id="dataSetDelete.buttonDelete" />
            </a>
            <a
              onClick={this.onClickCloseButton}
              href="/"
              className="setting-account__btnbox--cancel"
            >
              <FormattedMessage id="dataSetDelete.buttonCancel" />
            </a>
          </div>
        </div>
      </>
    )
  }

  render() {
    const { dataSetDelete } = this.props
    switch (dataSetDelete.modal) {
      case DeleteModalStates.CLOSE:
        return null
      case DeleteModalStates.OPEN:
        return this.renderOpen()
      default:
        return null
    }
  }
}
