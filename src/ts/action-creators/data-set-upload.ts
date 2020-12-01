import {
  OpenModalAction,
  CloseModalAction,
  UploadAction,
  ChangeTabAction,
  UploadModalTabs,
  ChangeOntologyFileAction,
  ChangeSbmFileAction,
  UploadForUmakaparserAction,
  DataSetUploadActionNames,
} from '../actions/data-set-upload'

export const openModal = (): OpenModalAction => ({
  type: DataSetUploadActionNames.OPEN_MODAL,
})

export const closeModal = (): CloseModalAction => ({
  type: DataSetUploadActionNames.CLOSE_MODAL,
})

export const upload = (file: File): UploadAction => ({
  type: DataSetUploadActionNames.UPLOAD,
  file,
})

export const changeTab = (tab: UploadModalTabs): ChangeTabAction => ({
  type: DataSetUploadActionNames.CHANGE_TAB,
  tab,
})

export const changeOntologyFile = (
  ontologyFile: File
): ChangeOntologyFileAction => ({
  type: DataSetUploadActionNames.CHANGE_ONTOLOGY_FILE,
  ontologyFile,
})

export const changeSbmFile = (sbmFile: File): ChangeSbmFileAction => ({
  type: DataSetUploadActionNames.CHANGE_SBM_FILE,
  sbmFile,
})

export const uploadForUmakaparser = (): UploadForUmakaparserAction => ({
  type: DataSetUploadActionNames.UPLOAD_FOR_UMAKAPARSER,
})

export default openModal
