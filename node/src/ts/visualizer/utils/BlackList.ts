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
    const [shorthand, className] = uri.split(':')
    const longhand = prefixes[shorthand]
    const rawUri = longhand ? `${longhand}${className}` : uri
    return (
      this.blacklist.classes.includes(rawUri) ||
      this.blacklist.prefixes.some((item) => rawUri.indexOf(item) > -1)
    )
  }
}

export default new Blacklist()
