/* eslint-disable camelcase */
export type ClassRelation = {
  object_class: string | null
  object_datatype: string | null
  subject_class: string | null
  triples: number
}

export type Property = {
  class_relations: ClassRelation[]
  triples: number
  uri: string
}
