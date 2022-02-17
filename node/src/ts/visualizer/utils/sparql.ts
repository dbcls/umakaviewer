export const makeQueryWhenRightClickClass = (_class: string) => {
  const query = `
    SELECT ?i
    WHERE {
      ?i a <${_class}> .
    }
    LIMIT 20
  `.replace(/^\n|\s+$|^ {4}/gm, '')
  return query
}

export const makeQueryWhenRightClickArrow = (
  domain: string,
  properties: string[],
  range: string
) => {
  const query = `
    SELECT ?sbj ?obj
    WHERE {
      ?sbj ${properties.map((v) => `<${v}>`).join('|')} ?obj .
      ?sbj a <${domain}> .
      ?obj a <${range}> .
    }
    LIMIT 20
  `.replace(/^\n|\s+$|^ {4}/gm, '')

  return query
}

export const navigateToYasgui = (endpoint: string, query: string) => {
  const params = new URLSearchParams()
  params.append('endpoint', endpoint)
  params.append('query', query)
  const win = window.open(
    `/yasgui?${params.toString()}`,
    '_blank',
    'noreferrer'
  )
  win?.focus()
}
