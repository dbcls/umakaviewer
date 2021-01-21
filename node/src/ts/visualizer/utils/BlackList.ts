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
}

export default new Blacklist()
