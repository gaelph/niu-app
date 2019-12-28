import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client'

import { useSettings, TIMEZONE_OFFSET } from '../settings/hooks'

import * as queries from "./queries"
import { Rule } from "./model"

import { CurrentState, currentDeviceState } from './device-state'

interface RulesOptions {
  onMutationSuccess: () => void
  onMutationError: (error: ApolloError) => void
}

interface RuleHook {
  loading: boolean
  rules: Rule[]
  create: () => void
  update: (rule: Rule) => void
  remove: (rule: Rule) => void
}

export function useRules(options?: RulesOptions): RuleHook {
  const { loading, data } = useQuery(queries.fetchRules)
  const [createRule, _createStatus] = useMutation(queries.createRule, {
    onCompleted: options && options.onMutationSuccess,
    onError: options && options.onMutationError,
    update(cache, { data: { createRule: rule } }) {
      const { listRules: rules } = cache.readQuery({
        query: queries.fetchRules
      })
      console.log('writeQuery')
      cache.writeQuery({
        query: queries.fetchRules,
        data: {
          listRules: [...rules, rule]
        }
      })
    }
  })

  const [updateRule, _updateStatus] = useMutation(queries.updateRule, {
    onCompleted: options && options.onMutationSuccess,
    onError: options && options.onMutationError
  })

  const [removeRule, _removeStatus] = useMutation(queries.deleteRule, {
    onCompleted: options && options.onMutationSuccess,
    onError: options && options.onMutationError,
    update(cache, { data: { deleteRule: { id } } }) {
      const { listRules: rules } = cache.readQuery({
        query: queries.fetchRules
      })
      cache.writeQuery({
        query: queries.fetchRules,
        data: {
          listRules: rules.filter(r => r.id !== id)
        }
      })
    }
  })

  const rules = data
    ? data.listRules.map(rule => Rule.fromObject(rule))
    : []

  const create = useCallback(() => {
    const rule = Rule.default()
    createRule({ variables: { rule }})
  }, [createRule])


  const update = useCallback((rule: Rule) => {
    updateRule({ variables: { rule }})
  }, [updateRule])


  const remove = useCallback(({ id }: Rule) => {
    removeRule({ variables: { rule: { id } }})
  }, [removeRule])

  const rulesAreLoading = loading
    || _createStatus.loading
    || _updateStatus.loading
    || _removeStatus.loading

  return {
    loading: rulesAreLoading,
    rules,
    create,
    update,
    remove
  }
}

export function useCurrentSchedule(): CurrentState | {} {
  const Settings = useSettings()
  const { rules } = useRules()
  const interval = useRef<number>()
  const [currentSchedule, setCurrentSchedule] = useState<CurrentState>({})

  let getSchedule = useCallback(async () => {
    if (Settings && rules) {
      const timezone = Settings.get(TIMEZONE_OFFSET)
  
      const schedule =  currentDeviceState(rules, timezone)
      setCurrentSchedule(schedule)
    }
  }, [Settings, rules])

  useEffect(() => {
    getSchedule()
  }, [Settings])

  useEffect(() => {
    if (interval.current) clearInterval(interval.current)

    interval.current = setInterval(getSchedule, 60 * 1000) as unknown as number

    return () => clearInterval(interval.current)
  }, [])

  return currentSchedule
}