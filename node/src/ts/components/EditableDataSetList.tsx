import * as React from 'react'
import ContentEditable from 'react-contenteditable'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { Url } from '../constants'
import {
  DataSet,
  EditedDataSet,
  EditDataSetAction,
  UpdateAction,
} from '../actions/data-set-list'
import { OpenModalAction as OpenDeleteModalAction } from '../actions/data-set-delete'

interface Props {
  dataSetList: DataSet[]
  actions: {
    editDataSet: (editedDataSet: EditedDataSet) => EditDataSetAction
    update: () => UpdateAction
  }
  deleteModalActions: {
    openModal: (dataSet: DataSet) => OpenDeleteModalAction
  }
}

export default class EditableDataSetList extends React.Component<Props, {}> {
  private titleEditableRefs: React.RefObject<HTMLTableDataCellElement>[]

  constructor(props: Props) {
    super(props)

    this.onClickDelete = this.onClickDelete.bind(this)
    this.onChangeTitle = this.onChangeTitle.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
  }

  private onClickDelete(
    dataSet: DataSet,
    event: React.MouseEvent<HTMLSpanElement>
  ) {
    event.preventDefault()

    const { deleteModalActions } = this.props
    deleteModalActions.openModal(dataSet)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  private onChangeTitle(id: number, refIndex: number) {
    const ref = this.titleEditableRefs[refIndex]
    if (ref.current) {
      const { actions } = this.props
      actions.editDataSet({ id, title: ref.current.textContent || '' })
    }
  }

  private onKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const { actions } = this.props
      actions.update()
      e.currentTarget.blur()
    }
  }

  render() {
    const { dataSetList } = this.props
    const urlPrefix = `${window.location.protocol}//${window.location.host}${Url.VISUALIZER_PREFIX}`
    this.titleEditableRefs = dataSetList.map(() =>
      React.createRef<HTMLTableDataCellElement>()
    )
    const dataSets = dataSetList.map((d, index) => (
      <tr key={`data-set-${d.id}`}>
        <ContentEditable
          innerRef={this.titleEditableRefs[index]}
          onChange={() => this.onChangeTitle(d.id, index)}
          onKeyPress={this.onKeyPress}
          html={`<span>${d.title}</span>`}
          tagName="td"
        />
        <td>
          <Link to={`${Url.VISUALIZER_PREFIX}/${d.path}`} target="_blank">
            {`${urlPrefix}/${d.path}`}
          </Link>
        </td>
        <td>{d.upload_at.format('YY.MM.DD HH:mm')}</td>
        <td>
          {d.is_public ? (
            <span>
              <FormattedMessage id="editableDataSetList.publicSettingOn" />
            </span>
          ) : (
            <span className="private">
              <FormattedMessage id="editableDataSetList.publicSettingOff" />
            </span>
          )}
          <Link to={`${Url.DATA_SET_SETTING}/${d.id}`}>
            <FontAwesomeIcon icon={faPen} />
          </Link>
        </td>
        <td>
          <span
            role="presentation"
            onClick={(e: any) => this.onClickDelete(d, e)}
            className="layout-datalist__deletbtn"
          >
            <FormattedMessage id="editableDataSetList.buttonDelete" />
          </span>
        </td>
      </tr>
    ))
    return <>{dataSets}</>
  }
}
