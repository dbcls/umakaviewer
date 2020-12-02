import { AppState } from '..'
import { Classes } from '../types/class'
import { Structure } from '../types/structure'
import { readTextFileContent } from '.'
import { Prefixes } from '../types/prefix'

class Blacklist {
  blacklist: { [key: string]: string[] }

  constructor() {
    this.blacklist = {}
  }

  configre(paths: { [key: string]: string }) {
    Object.entries(paths).forEach(([k, v]) => {
      this.blacklist[k] = readTextFileContent(v).split('\n').slice(0, -1) // last item is always blank text
    })
  }

  has(uri: string, prefixes: Prefixes) {
    const [prefixKey, className] = uri.split(':')
    const prefix = prefixes[prefixKey]
    return (
      prefix !== undefined &&
      (('classes' in this.blacklist &&
        this.blacklist.classes.includes(`${prefix}${className}`)) ||
        ('prefixes' in this.blacklist &&
          this.blacklist.prefixes.some(
            (item) => prefix === item || prefix.startsWith(item)
          )))
    )
  }

  filter({ structure, classes, properties, prefixes }: AppState): AppState {
    const filterStructure = (children: Structure[]) => {
      for (let i = 0; i < children.length; i += 1) {
        const node = children[i]
        if (this.has(node.uri, prefixes)) {
          children.splice(i, 1)
          i -= 1
        } else if (node.children !== undefined) {
          filterStructure(node.children)
        }
      }
    }
    filterStructure(structure)

    const filteredClasses = Object.keys(classes).reduce<Classes>((obj, uri) => {
      if (this.has(uri, prefixes)) {
        return obj
      }
      obj[uri] = classes[uri] // eslint-disable-line no-param-reassign
      return obj
    }, {})

    properties.forEach(({ class_relations: relations }) => {
      for (let i = 0; i < relations.length; i += 1) {
        const { subject_class: s, object_class: o } = relations[i]
        if ((s && this.has(s, prefixes)) || (o && this.has(o, prefixes))) {
          relations.splice(i, 1)
          i -= 1
        }
      }
    })

    return {
      structure,
      classes: filteredClasses,
      properties,
      prefixes,
    }
  }
}

export default new Blacklist()
