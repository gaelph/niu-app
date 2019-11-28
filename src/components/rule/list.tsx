import React from 'react'
import { View, StyleSheet } from 'react-native'

import { Rule } from '../../api/models/rule'

import RuleListItem from './item'

export default ({ rules, onStartEditing, onChange, onRemove }) => {

  return (
    <View style={styles.container}>
      {
        rules.map(rule =>
          <RuleListItem key={rule.id} rule={rule} onStartEditing={onStartEditing} onChange={onChange} onRemove={onRemove} />
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