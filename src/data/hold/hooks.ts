import { useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import dayjs from 'dayjs'

import * as queries from "./queries"
import { Hold } from "./model"

interface HoldResult {
  hold: Hold
  updateHold: (hold: Hold) => void
}

export function useHold({ onMutationSuccess, onMutationError }): HoldResult | null {
  const { data } = useQuery(queries.fetchHold)
  // Mutations
  // For reasons unknown, create and delete mutations
  // require a manual cache update for Holds 
  const [create, _crateStatus] = useMutation(queries.createHold, {
    onCompleted: onMutationSuccess,
    onError: onMutationError,
    update(cache, { data: { createHold } }) {
      cache.writeQuery({
        query: queries.fetchHold,
        data: {
          getHold: createHold
        }
      })
    }
  })
  const [update, _updateStatus] = useMutation(queries.updateHold, {
    onCompleted: onMutationSuccess,
    onError: onMutationError,
  })
  const [remove, _removeStatus] = useMutation(queries.deleteHold, {
    onCompleted: onMutationSuccess,
    onError: onMutationError,
    update(cache, _) {
      cache.writeQuery({
        query: queries.fetchHold,
        data: {
          getHold: null
        }
      })
    }
  })

  // the update hold call back
  // happens to also decice whether to
  // create or delete the hold
  const updateHold = useCallback((hold: Hold) => {
    // Query returned no hold, but called with one ? create it
    if (hold != null && !data.getHold) {
      hold.untilTime = hold.untilTime.utc()
      create({ variables: { hold } })
    }
    // Query return a hold, and called with one ? update it
    else if (hold != null && data && data.getHold) {
      hold.untilTime = hold.untilTime.utc()
      update({ variables: { hold } })
    }
    // Query returned a hold, but called with none ? delete it
    else if (hold == null && data && data.getHold) {
      remove({ variables: { id: data.getHold.id } })
    }
  }, [data, update, remove])

  // Instanciate the Hold or create a dummy one
  const hold = data && data.getHold
    ? Hold.from(data.getHold)
    // TODO: use default temperature value from settings
    : Hold.new(15, dayjs().subtract(1, 'day'))

  return { 
    hold,
    updateHold
  }
}
