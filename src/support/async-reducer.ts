

export type AsyncReducerState<T> = {
  data: T,
  loading: boolean,
  error: Error
}

export type Action<T> = {
  type: AsyncActions,
  payload?: T
}

export enum AsyncActions {
  Fetching,
  Fetched,
  Error
}

export function reducer<T>(): [React.Reducer<AsyncReducerState<T>, Action<T | Error | boolean>>, AsyncReducerState<T>] {
  const defaultState: AsyncReducerState<T> = {
    data: null,
    error: null,
    loading: false
  }

  return [asyncReducer, defaultState]
}


function asyncReducer<T>(state: AsyncReducerState<T>, action: Action<T | Error | boolean>): AsyncReducerState<T> {
  switch (action.type) {
    case AsyncActions.Fetching:
      return {
        ...state,
        loading: action.payload as boolean
      }
    case AsyncActions.Fetched:
      return {
        ...state,
        // loading: false,
        data: action.payload as T
      };
    case AsyncActions.Error:
      return {
        ...state,
        loading: false,
        error: action.payload as Error
      };
    default:
      return state;
  }
}