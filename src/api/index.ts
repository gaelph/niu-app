import { useReducer, useEffect, useState, useCallback, useRef } from 'react'
import { AsyncStorage } from 'react-native'
import { reducer, ApiActions, Action } from "./api-reducer"
import uuid from 'uuid/v4'
export * from './queries'
import { CursoredList } from './types'

interface PaginatedQuery {
  page?: number,
  pageSize?: number
}

function transformDates(object) {
  if (typeof object === 'string') {
    if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(object)) {
      return new Date(object)
    }
  }

  if (Array.isArray(object)) {
    return object.map(transformDates)
  }

  if (typeof object === 'object' && object !== null && object !== undefined) {
    return Object.entries(object).reduce((acc, [key, value]) => {
      acc[key] = transformDates(value)

      return acc
    }, {})
  }

  return object
} 

function callApi<TYPE, PARAMS extends PaginatedQuery>(queryId: string, query: ApiQuery<TYPE, PARAMS>, params: PARAMS, dispatch: React.Dispatch<Action<TYPE | Error | boolean>>) {
  dispatch({ type: ApiActions.Fetching, payload: true })

  AsyncStorage.getItem(`Query_${queryId}`, (err, result) => {
    if (err) {
      console.warn(err)
    }

    if (result) {
      let transformed = transformDates(JSON.parse(result))
      // console.log('Serving result from storage for query', queryId, transformed)
      dispatch({ type: ApiActions.Fetched, payload: transformed })
    }

    query(params)
    .then(response => {
      dispatch({ type: ApiActions.Fetching, payload: false })
      dispatch({ type: ApiActions.Fetched, payload: response })
  
      AsyncStorage.setItem(`Query_${queryId}`, JSON.stringify(response))
    })
    .catch(error => {
      dispatch({ type: ApiActions.Error, payload: error })
    })
  })


}

type ApiQuery<TYPE, PARAMS extends PaginatedQuery> = (params?: PARAMS) => Promise<TYPE>

interface ApiHookData<TYPE> {
  data: TYPE | CursoredList<TYPE>,
  loading: boolean,
  error: Error,
  refresh?: () => void,
  fetchMore?: () => void,
}

export function useApiPolling<TYPE, PARAMS>(query: ApiQuery<TYPE, PARAMS>, interval: number, params?: PARAMS): ApiHookData<TYPE> {
  let [state, dispatch] = useReducer(...reducer<TYPE>())
  let [t, setT] = useState<number>(undefined);
  let [call, setCall] = useState<boolean>(false);
  let queryId = useRef(query.name)

  useEffect(() => {
    callApi<TYPE, PARAMS>(queryId.current, query, params, dispatch)
  }, [call, dispatch]);

  useEffect(() => {
    let i = setTimeout(() => {
      setCall(!call)
    }, interval)

    setT(i)

    return () => clearTimeout(t)
  }, [call])

  const refresh = useCallback(() => {
    callApi<TYPE, PARAMS>(queryId.current, query, params, dispatch)
  }, [query, params, state, dispatch, call])

  return {
    data: state.data as TYPE, 
    loading: state.loading,
    error: state.error, 
    refresh: refresh,
  };
}


export function useApi<TYPE, PARAMS extends PaginatedQuery>(query: ApiQuery<TYPE, PARAMS>, params?: PARAMS): ApiHookData<TYPE> {
  let [state, dispatch] = useReducer(...reducer<TYPE>())
  let queryId = useRef(uuid())

  useEffect(() => {
    callApi<TYPE, PARAMS>(queryId.current, query, params, dispatch)
  }, [])

  const refresh = useCallback(() => {
    callApi<TYPE, PARAMS>(queryId.current, query, params, dispatch)
  }, [])

  let cursoredList = state.data as CursoredList<TYPE>

  let fetchMore = () => {}
  if (cursoredList != null && cursoredList.items && cursoredList.cursor) {
    fetchMore = () => {
      callApi<TYPE, PARAMS>(queryId.current, query, cursoredList.cursor as unknown as PARAMS, dispatch)
    }
  }

  return { 
    data: state.data,
    loading: state.loading, 
    error: state.error,
    refresh: refresh,
    fetchMore
  }
}

export function useMutation<PARAMS, RETURN>(mutation: ApiQuery<RETURN, PARAMS>): (params: PARAMS) => ApiHookData<RETURN> {
  let [state, dispatch] = useReducer(...reducer<RETURN>())
  
  let queryId = useRef<string>(uuid())
  let timeout = useRef<number>()
  return useCallback((params: PARAMS) => {

    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    let t = setTimeout(() => {
      callApi(queryId.current, mutation, params, dispatch)
    }, 2000)

    timeout.current = t

    return {
      data: state.data,
      loading: state.loading,
      error: state.error
    }
  }, [])
}