import axios, { AxiosInstance } from 'axios'
import firebase from 'firebase'

import { Url, PUBLIC_DATA_SET_SIZE_PER_PAGE } from './constants'
import { PublicDataSetParams } from './actions/data-set-list'
import { DataSetParams } from './actions/admin'
import { getApiEndpoint } from './utils'

class ApiClient {
  user: firebase.User | null

  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: getApiEndpoint(),
    })
  }

  private async authorize() {
    if (this.user) {
      const token = await this.user.getIdToken()
      this.setToken(token)
    }
  }

  private async get(url: string) {
    await this.authorize()
    return this.api.get(url)
  }

  private async post(url: string, data: any, headers?: object) {
    await this.authorize()
    if (headers) {
      return this.api.post(url, data, { headers })
    }
    return this.api.post(url, data)
  }

  private async delete(url: string) {
    await this.authorize()
    return this.api.delete(url)
  }

  private async patch(url: string, data: object) {
    await this.authorize()
    return this.api.patch(url, data)
  }

  private setToken = (token: string) => {
    this.api.defaults.headers = {
      ...this.api.defaults.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  setUser = (user: firebase.User) => {
    this.user = user
  }

  removeUser = () => {
    this.user = null
    const { headers } = this.api.defaults
    delete headers.Authorization
    this.api.defaults.headers = headers
  }

  signUp = (firebaseUid: string, displayName: string) => {
    return this.post(Url.Api.CREATE_USER, {
      firebase_uid: firebaseUid,
      display_name: displayName,
    })
  }

  login = (token: string) => {
    return this.post(Url.Api.AUTH, { token })
  }

  getDataSetList = () => {
    return this.get(Url.Api.DATA_SET_LIST)
  }

  getVisualizedDataSet = (path: string) => {
    return this.get(Url.Api.visualize(path))
  }

  uploadDataSet(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const headers = { 'Content-Type': 'multipart/form-data' }
    return this.post(Url.Api.DATA_SET_LIST, formData, headers)
  }

  uploadForUmakaparser(sbm: File, ontology: File | null) {
    const formData = new FormData()
    formData.append('sbm', sbm)
    if (ontology) {
      formData.append('ontology', ontology)
    }
    const headers = { 'Content-Type': 'multipart/form-data' }
    return this.post(Url.Api.DATA_SET_GENERATE, formData, headers)
  }

  getResultOfUmakaparserTask(taskId: string) {
    return this.get(Url.Api.resultOfDataSetGenerate(taskId))
  }

  deleteDataSet(dataSetId: number) {
    return this.delete(`${Url.Api.DATA_SET_LIST}/${dataSetId}`)
  }

  updateDataSet(dataSetId: number, data: object) {
    return this.patch(`${Url.Api.DATA_SET_LIST}/${dataSetId}`, data)
  }

  deleteMe() {
    return this.delete(Url.Api.ME)
  }

  getDataSet(dataSetId: number) {
    return this.get(`${Url.Api.DATA_SET_LIST}/${dataSetId}`)
  }

  getMe() {
    return this.get(Url.Api.ME)
  }

  getMyCustomToken() {
    return this.get(Url.Api.MY_CUSTOM_TOKEN)
  }

  updateMe(data: object) {
    return this.patch(Url.Api.ME, data)
  }

  getPublicDataSetList(params: PublicDataSetParams) {
    let queryString = `?sort=${params.sort}`

    if (params.search) {
      queryString = `${queryString}&search=${encodeURI(params.search)}`
    }

    const size = params.size ? params.size : PUBLIC_DATA_SET_SIZE_PER_PAGE
    queryString = `${queryString}&size=${size}`

    const page = params.page ? params.page : 1
    queryString = `${queryString}&page=${page}`

    return this.get(`${Url.Api.PUBLIC_DATA_SET_LIST}${queryString}`)
  }

  getDataSetListAdmin(params: DataSetParams) {
    const page = params.page ? params.page : 1
    const queryString = `?page=${page}`
    return this.get(`${Url.Api.Admini.ADMIN_DATA_SET_LIST}${queryString}`)
  }

  deleteDataSetAdmin(id: number) {
    return this.delete(`${Url.Api.Admini.ADMIN_DATA_SET_LIST}/${id}`)
  }

  checkHealthy() {
    return this.get(`${Url.Api.HEALTHY}`)
  }
}

export default new ApiClient()
