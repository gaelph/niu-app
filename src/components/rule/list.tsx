import React from 'react'
import { View, StyleSheet } from 'react-native'

import { Rule, Schedule } from '../../data/rules/model'
import { Day } from '../../support/days'

import RuleListItem from './Item'

interface RuleListProps {
  rules: Rule[]
  defaultTemperature: number
  onStartEditing: (inputRef: any) => void
  onRemove: (rule: Rule) => void
  onNameChange: (rule: Rule, name: string) => void
  onActiveChange: (rule: Rule, active: boolean) => void
  onRepeatChange: (rule: Rule, repeat: boolean) => void
  onDaysChange: (rule: Rule, day: Day, value: boolean) => void
  onAddSchedule: (rule: Rule) => void
  onUpdateSchedule: (rule: Rule, idx: number, schedule: Schedule) => void
  onRemoveSchedule: (rule: Rule, idx: number) => void
}

export default (props: RuleListProps) => {
  const {
    rules,
    defaultTemperature,
    onStartEditing,
    onRemove,
    onNameChange,
    onActiveChange,
    onRepeatChange,
    onDaysChange,
    onAddSchedule,
    onUpdateSchedule,
    onRemoveSchedule,
  } = props

  return (
    <View style={styles.container}>
      {
        rules.map(rule =>
          <RuleListItem key={rule.id} 
            rule={rule} 
            defaultTemperature={defaultTemperature}
            onStartEditing={onStartEditing}
            onNameChange={onNameChange}
            onActiveChange={onActiveChange}
            onRepeatChange={onRepeatChange}
            onDaysChange={onDaysChange}
            onAddSchedule={onAddSchedule}
            onUpdateSchedule={onUpdateSchedule}
            onRemoveSchedule={onRemoveSchedule}
            onRemove={onRemove} />
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // position: 'relative',
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 30, 
    // paddingBottom: 54 + 24,
    marginTop: 40,
  },
})