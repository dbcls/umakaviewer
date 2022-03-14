/* eslint-disable camelcase */
import { Classes } from './class'
import { Metadata } from './metadata'
import { Prefixes } from './prefix'
import { Property } from './property'
import { Structure } from './structure'

declare global {
  interface Document {
    documentMode?: number
  }

  interface Navigator {
    userLanguage?: string
    browserLanguage?: string
  }
}

export type AppState = {
  structure: Structure[]
  classes: Classes
  properties: Property[]
  prefixes: Prefixes
}

export type Content = {
  inheritance_structure: Structure[]
  classes: Classes
  properties: Property[]
  prefixes: Prefixes
  meta_data: Metadata
}
