import { CursoredList } from './types'

export type ApiReducerState<T> = {
  data: T | CursoredList<T>,
  loading: boolean,
  error: Error
}

export type Action<T> = {
  type: ApiActions,
  payload?: T
}

export enum ApiActions {
  Fetching,
  Fetched,
  Error
}

export function reducer<T>(): [React.Reducer<ApiReducerState<T>, Action<T | Error | boolean>>, ApiReducerState<T>] {
  const defaultState: ApiReducerState<T> = {
    data: null,
    error: null,
    loading: false
  }

  return [apiReducer, defaultState]
}


function apiReducer<T>(state: ApiReducerState<T>, action: Action<T | Error | boolean>): ApiReducerState<T> {
  switch (action.type) {
    case ApiActions.Fetching:
      return {
        ...state,
        loading: action.payload as boolean
      }
    case ApiActions.Fetched:
      return {
        ...state,
        // loading: false,
        data: action.payload as T
      };
    case ApiActions.Error:
      return {
        ...state,
        loading: false,
        error: action.payload as Error
      };
    default:
      return state;
  }
}