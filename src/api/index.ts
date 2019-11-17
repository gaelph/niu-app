import { reducer, ApiActions, Action } from "./api-reducer"
export * from './queries'
import { useReducer, useEffect, useState, useCallback } from 'react'
import { CursoredList } from './types'

interface PaginatedQuery {
  page?: number,
  pageSize?: number
}

function callApi<TYPE, PARAMS extends PaginatedQuery>(query: ApiQuery<TYPE, PARAMS>, params: PARAMS, dispatch: React.Dispatch<Action<TYPE | Error>>) {
  dispatch({ type: ApiActions.Fetching })

  query(params)
  .then(response => {
    dispatch({ type: ApiActions.Fetched, payload: response })
  })
  .catch(error => {
    dispatch({ type: ApiActions.Error, payload: error })
  })
}

type ApiQuery<TYPE, PARAMS extends PaginatedQuery> = (params?: PARAMS) => Promise<TYPE>

interface ApiHookData<TYPE> {
  data: TYPE | CursoredList<TYPE>,
  loading: boolean,
  error: Error,
  refresh: () => void,
  fetchMore?: () => void,
}

export function useApiPolling<TYPE, PARAMS>(query: ApiQuery<TYPE, PARAMS>, interval: number, params?: PARAMS): ApiHookData<TYPE> {
  let [state, dispatch] = useReducer(...reducer<TYPE>())
  let [t, setT] = useState<number>(undefined);
  let [call, setCall] = useState<boolean>(false);

  useEffect(() => {
    callApi<TYPE, PARAMS>(query, params, dispatch)
  }, [call]);

  useEffect(() => {
    let i = setTimeout(() => {
      setCall(!call)
    }, interval)

    setT(i)

    return () => clearTimeout(t)
  }, [call])

  const refresh = useCallback(() => {
    callApi<TYPE, PARAMS>(query, params, dispatch)
  }, [call])

  return {
    data: state.data as TYPE, 
    loading: state.loading,
    error: state.error, 
    refresh: refresh,
  };
}


export function useApi<TYPE, PARAMS extends PaginatedQuery>(query: ApiQuery<TYPE, PARAMS>, params?: PARAMS): ApiHookData<TYPE> {
  let [state, dispatch] = useReducer(...reducer<TYPE>())

  useEffect(() => {
    callApi<TYPE, PARAMS>(query, params, dispatch)
  }, [])

  const refresh = useCallback(() => {
    callApi<TYPE, PARAMS>(query, params, dispatch)
  }, [])

  let cursoredList = state.data as CursoredList<TYPE>

  let fetchMore = () => {}
  if (cursoredList != null && cursoredList.items && cursoredList.cursor) {
    fetchMore = () => {
      callApi<TYPE, PARAMS>(query, cursoredList.cursor as PARAMS, dispatch)
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

