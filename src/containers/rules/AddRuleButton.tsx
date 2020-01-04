/**
 * @category Containers
 * @module containers/rules
 * @packageDocumentation
 */
import React, { useCallback } from 'react'

import { useMutation } from '@apollo/react-hooks'

import { fetchRules, createRule } from 'data/rules/queries'
import { Rule } from 'data/rules/model'

import PlusButton from 'components/rule/PlusButton'

import Toast from 'support/toast'

/**
 * Button to create new [[Rule]]a at the bottom of the screen
 */
export default function AddRuleButton(): React.ReactElement {
  // TODO: Should use `useRules` hook instead of Apollo mutations directly
  const [mutation] = useMutation(createRule, {
    onCompleted: () => Toast.showChangesOK(),
    onError: error => {
      console.log(error)
      console.log(error.graphQLErrors)
      Toast.showError()
    },

    // Update cahche when the query completes
    update(cache, { data: { createRule: rule } }) {
      const { listRules: rules } = cache.readQuery({
        query: fetchRules
      })
      
      cache.writeQuery({
        query: fetchRules,
        data: {
          listRules: [...rules, rule]
        }
      })
    }
  })

  // Sugary wrapper
  const create = useCallback(() => {
    const rule = Rule.default()

    mutation({ variables: { rule } })
  }, [])
  return <PlusButton onPress={create} />
}