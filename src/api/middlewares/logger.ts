import { ApolloLink } from 'apollo-link'


export default new ApolloLink((operation, forward) => {
  const start = +new Date()
  const queries = operation.query.definitions.reduce((acc, def) => {
    // @ts-ignore
    acc[def.name.value] = {
      // @ts-ignore
      type: def.operation,
      // @ts-ignore
      selections: (def.selectionSet.selections).map(s => s.name.value)
    }

    return acc
  }, {})

  return forward(operation).map(result => {
    const { data, errors } = result
    const duration = +new Date() - start

    Object.keys(queries).forEach(key => {
      // console.group(key)
      const { type, selections } = queries[key]
      if (data) {
        selections.forEach(selection => {
          if (data.hasOwnProperty(selection)) {
            console.info(`%c[${(new Date()).toISOString()}] %c${type} %c${selection} %cOK %c+${duration}ms`, "color:gray;", type == "query" ? "color:cyan;" : "color:coral;", "color:white;", "color:lime", "color:gray;")
          }
        })
      }

      // console.groupEnd() 
    })

    if (errors) {
      errors.forEach(error => {
        console.info(`%c${error.path.join('.')}: ${error.message}`, "color:red;")
      })
    }

    return result
  })
})
