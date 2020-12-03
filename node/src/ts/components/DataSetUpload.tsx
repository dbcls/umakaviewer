import * as React from 'react'
import Dropzone from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'
import { FormattedMessage } from 'react-intl'

import { Color } from '../constants'
import {
  DataSetUploadState,
  UploadModalStates,
  CloseModalAction,
  UploadAction,
  ChangeTabAction,
  ChangeOntologyFileAction,
  ChangeSbmFileAction,
  UploadModalTabs,
  UploadForUmakaparserAction,
  UploadErrorType,
} from '../actions/data-set-upload'

interface Props {
  dataSetUpload: DataSetUploadState
  actions: {
    closeModal: () => CloseModalAction
    upload: (file: File) => UploadAction
    changeTab: (tab: UploadModalTabs) => ChangeTabAction
    changeOntologyFile: (ontologyFile: File) => ChangeOntologyFileAction
    changeSbmFile: (sbmFile: File) => ChangeSbmFileAction
    uploadForUmakaparser: () => UploadForUmakaparserAction
  }
}

export default class DataSetUpload extends React.Component<Props, {}> {
  private ontologyFileRef: React.RefObject<HTMLInputElement>

  private sbmFileRef: React.RefObject<HTMLInputElement>

  constructor(props: Props) {
    super(props)

    this.onClickCloseButton = this.onClickCloseButton.bind(this)
    this.onClickOpneFileDialog = this.onClickOpneFileDialog.bind(this)
    this.onDropFile = this.onDropFile.bind(this)
    this.onChangeTab = this.onChangeTab.bind(this)
    this.onChangeOntologyFile = this.onChangeOntologyFile.bind(this)
    this.onChangeSbmFile = this.onChangeSbmFile.bind(this)
    this.onClickUploadForUmakaparser = this.onClickUploadForUmakaparser.bind(
      this
    )

    this.ontologyFileRef = React.createRef<HTMLInputElement>()
    this.sbmFileRef = React.createRef<HTMLInputElement>()
  }

  private onClickCloseButton(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const { actions } = this.props
    actions.closeModal()
  }

  private onClickOpneFileDialog() {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'application/json'
    fileInput.onchange = () => {
      if (fileInput.files) {
        const { actions } = this.props
        actions.upload(fileInput.files[0])
      }
    }
    fileInput.click()
  }

  private onDropFile(acceptedFiles: File[]) {
    const { actions } = this.props
    actions.upload(acceptedFiles[0])
  }

  private onChangeTab(tab: UploadModalTabs) {
    const { actions } = this.props
    actions.changeTab(tab)
  }

  private static onClickFileIcon(ref: React.RefObject<HTMLInputElement>) {
    if (ref.current) {
      ref.current.click()
    }
  }

  private onChangeOntologyFile() {
    if (this.ontologyFileRef.current && this.ontologyFileRef.current.files) {
      const { actions } = this.props
      actions.changeOntologyFile(this.ontologyFileRef.current.files[0])
    }
  }

  private onChangeSbmFile() {
    if (this.sbmFileRef.current && this.sbmFileRef.current.files) {
      const { actions } = this.props
      actions.changeSbmFile(this.sbmFileRef.current.files[0])
    }
  }

  private onClickUploadForUmakaparser() {
    const { actions } = this.props
    actions.uploadForUmakaparser()
  }

  private renderOpen() {
    const { dataSetUpload } = this.props
    let renderedUpload
    switch (dataSetUpload.tab) {
      case UploadModalTabs.JSON:
        renderedUpload = this.renderJsonUpload()
        break
      case UploadModalTabs.TTL:
        renderedUpload = this.renderTtlUpload()
        break
      default:
        break
    }
    return (
      <>
        <div className="overlayCol-wall" />
        <div className="overlayCol upload-firststep">
          <h2>
            <FormattedMessage id="dataSetUpload.headerOpen" />
          </h2>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="overlayCol__btn-close"
          >
            <span>close</span>
          </a>
          <div className="upload-tabs">
            <div
              className={
                dataSetUpload.tab === UploadModalTabs.JSON
                  ? 'upload-active-tab'
                  : ''
              }
              role="presentation"
              onClick={() => this.onChangeTab(UploadModalTabs.JSON)}
            >
              <FormattedMessage id="dataSetUpload.tabJson" />
            </div>
            <div
              className={
                dataSetUpload.tab === UploadModalTabs.TTL
                  ? 'upload-active-tab'
                  : ''
              }
              role="presentation"
              onClick={() => this.onChangeTab(UploadModalTabs.TTL)}
            >
              <FormattedMessage id="dataSetUpload.tabOntologySbm" />
            </div>
          </div>
          {renderedUpload}
        </div>
      </>
    )
  }

  private renderJsonUpload() {
    return (
      <Dropzone onDrop={this.onDropFile}>
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            role="presentation"
            onClick={this.onClickOpneFileDialog}
            className="upload-uploadarea"
          >
            <i className="upload-uploadarea__upload-icon" />
            <p>
              <FormattedMessage id="dataSetUpload.chooseJsonFile" />
            </p>
            <p>
              <FormattedMessage id="dataSetUpload.dragAndDropJsonFile" />
            </p>
            <input {...getInputProps()} />
          </div>
        )}
      </Dropzone>
    )
  }

  private renderTtlUpload() {
    const { dataSetUpload } = this.props
    const disabled = !dataSetUpload.sbmFile
    return (
      <div className="upload-ttl__upload-area-wrapper">
        <p className="upload-ttl__note">
          <FormattedMessage id="dataSetUpload.chooseOntologyFile" />
        </p>
        <div className="upload-ttl__upload-area">
          <div
            className="upload-ttl__upload-icon"
            role="presentation"
            onClick={() => DataSetUpload.onClickFileIcon(this.ontologyFileRef)}
          >
            <FontAwesomeIcon
              icon={faFileAlt}
              size="5x"
              color={dataSetUpload.ontologyFile ? Color.MAIN : ''}
            />
            <span>
              <FormattedMessage id="dataSetUpload.fileIconOntology" />
            </span>
            <input
              type="file"
              accept=".ttl,.nt,.xml,.owl,.rdf"
              ref={this.ontologyFileRef}
              onChange={this.onChangeOntologyFile}
            />
          </div>
          <div
            className="upload-ttl__upload-icon"
            role="presentation"
            onClick={() => DataSetUpload.onClickFileIcon(this.sbmFileRef)}
          >
            <FontAwesomeIcon
              icon={faFileAlt}
              size="5x"
              color={dataSetUpload.sbmFile ? Color.MAIN : ''}
            />
            <span>
              <FormattedMessage id="dataSetUpload.fileIconSbm" />
            </span>
            <input
              type="file"
              accept=".ttl,.nt"
              ref={this.sbmFileRef}
              onChange={this.onChangeSbmFile}
            />
          </div>
        </div>
        <div className="upload-ttl__upload-button">
          <button
            type="button"
            className={disabled ? 'disabled-button' : ''}
            disabled={disabled}
            onClick={this.onClickUploadForUmakaparser}
          >
            <FormattedMessage id="dataSetUpload.buttonUpload" />
          </button>
        </div>
      </div>
    )
  }

  private renderUploading() {
    return (
      <>
        <div className="overlayCol-wall" />
        <div className="overlayCol upload-loading">
          <h2>
            <FormattedMessage id="dataSetUpload.headerUploading" />
          </h2>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="overlayCol__btn-close"
          >
            <span>close</span>
          </a>
          <div className="upload-loading__loading-images">
            <div className="floatingCirclesG">
              <div className="f_circleG frotateG_01" />
              <div className="f_circleG frotateG_02" />
              <div className="f_circleG frotateG_03" />
              <div className="f_circleG frotateG_04" />
              <div className="f_circleG frotateG_05" />
              <div className="f_circleG frotateG_06" />
              <div className="f_circleG frotateG_07" />
              <div className="f_circleG frotateG_08" />
            </div>
          </div>
        </div>
      </>
    )
  }

  private renderUploadDone() {
    return (
      <>
        <div className="overlayCol-wall" />
        <div className="overlayCol upload-completion">
          <h2>
            <FormattedMessage id="dataSetUpload.headerUploadDone" />
          </h2>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="overlayCol__btn-close"
          >
            <span>close</span>
          </a>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="upload-completion__backbtn"
          >
            <FormattedMessage id="dataSetUpload.buttonBackToList" />
          </a>
        </div>
      </>
    )
  }

  private renderUploadError() {
    const { dataSetUpload } = this.props
    return (
      <>
        <div className="overlayCol-wall" />
        <div className="overlayCol upload-error">
          <h2>
            <FormattedMessage id="dataSetUpload.headerUploadError" />
          </h2>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="overlayCol__btn-close"
          >
            <span>close</span>
          </a>
          <div className="upload-errorCol">
            <div className="upload-errorCol__layout">
              <div className="upload-errorCol__layout--column">
                <h3>
                  {(() => {
                    switch (dataSetUpload.errorType) {
                      case UploadErrorType.CONVERT_ERROR:
                        return (
                          <FormattedMessage id="dataSetUpload.convertError" />
                        )
                      case UploadErrorType.OWL_ERROR:
                        return <FormattedMessage id="dataSetUpload.owlError" />
                      case UploadErrorType.SBM_ERROR:
                        return <FormattedMessage id="dataSetUpload.sbmError" />
                      default:
                        return (
                          <FormattedMessage id="dataSetUpload.defaultUploadErrorMessage" />
                        )
                    }
                  })()}
                </h3>
              </div>
            </div>
          </div>
          <a
            onClick={this.onClickCloseButton}
            href="/"
            className="upload-error__backbtn"
          >
            <FormattedMessage id="dataSetUpload.buttonBackToList" />
          </a>
        </div>
      </>
    )
  }

  render() {
    const { dataSetUpload } = this.props

    switch (dataSetUpload.modal) {
      case UploadModalStates.CLOSE:
        return null
      case UploadModalStates.OPEN:
        return this.renderOpen()
      case UploadModalStates.UPLOADING:
        return this.renderUploading()
      case UploadModalStates.UPLOAD_DONE:
        return this.renderUploadDone()
      case UploadModalStates.UPLOAD_ERROR:
        return this.renderUploadError()
      default:
        return null
    }
  }
}
