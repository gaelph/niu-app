/**
 * React Hook use to fetch and interact with Rules
 * 
 * **Example**
 * ```ts
 * import { useRules } from 'data/rules/hooks'
 * 
 * function Container() {
 *   const { loading, rules, create, update, remove } = useRules()
 * 
 *   return <Component rules={rules} />
 * }
 * ```
 * @category Data Hooks
 * @module data/rules/hooks
 * @packageDocumentation
 */
import { useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client'


import * as queries from "./queries"
import { Rule } from "./model"


interface RulesOptions {
  /** Called if a mutation is successful */
  onMutationSuccess: () => void
  /** Called if a mutation fails */
  onMutationError: (error: ApolloError) => void
}

interface RuleHook {
  rules: Rule[]
  /** Loading state. `true` if a query or mutation is ongoing */
  loading: boolean
  /**
   * `true` if rules are ready to be used
   * @deprecated
   */
  ready: boolean
  /** Creates a rule with default values */
  create: () => void
  /** Updates a rule with values from the [[Rule]] object passed a parameter */
  update: (rule: Rule) => void
  /** Removes the rule passed as parameter */
  remove: (rule: Rule) => void
}

// This global object prevents rerenders
const DEFAULT_RULES = []

export function useRules(options?: RulesOptions): RuleHook {
  // Query to fetch
  const { loading, data, networkStatus } = useQuery(queries.fetchRules)

  // Mutations
  // Apollo requires that the cache is updated manually after each one of them

  // CREATE
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

  // UPDATE
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

  // DELETE
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

  // Map result from Api to the Rule class
  const rules = useMemo(() => data
    ? data.listRules.map(rule => Rule.fromObject(rule))
    : DEFAULT_RULES, [data])

  // Wrapped mutations for simpler usage
  const create = useCallback(() => {
    const rule = Rule.default()
    createRule({ variables: { rule }})
  }, [createRule])

  const update = useCallback((rule: Rule) => {
    updateRule({ variables: { rule } })
  }, [rules, updateRule])

  const remove = useCallback(({ id }: Rule) => {
    removeRule({ variables: { rule: { id } }})
  }, [removeRule])

  // loading state
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