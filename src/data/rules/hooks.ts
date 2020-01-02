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
  ready: boolean
  rules: Rule[]
  create: () => void
  update: (rule: Rule) => void
  remove: (rule: Rule) => void
}

const DEFAULT_RULES = []

export function useRules(options?: RulesOptions): RuleHook {
  const { loading, data, networkStatus } = useQuery(queries.fetchRules, {
    // fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true
  })
  const [createRule, _createStatus] = useMutation(queries.createRule, {
    onCompleted: options && options.onMutationSuccess,
    onError: options && options.onMutationError,
    update(cache, { data: { createRule: rule } }) {
      const { listRules: rules } = cache.readQuery({
        query: queries.fetchRules
      })
      
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
    onError: options && options.onMutationError,
    update(cache, { data: { updateRule: rule } }) {
      const { listRules: rules } = cache.readQuery({
        query: queries.fetchRules
      })
      cache.writeQuery({
        query: queries.fetchRules,
        data: {
          listRules: rules.map(r => {
            if (rule.id === r.id) {
              return rule
            }
            return r
          })
        }
      })
    }
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
    : DEFAULT_RULES

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

  const rulesAreLoading = 
    loading || 
    _createStatus.loading || 
    _updateStatus.loading || 
    _removeStatus.loading

  return {
    loading: rulesAreLoading,
    rules: rules,
    create,
    update,
    remove,
    ready: networkStatus == 7
  }
}