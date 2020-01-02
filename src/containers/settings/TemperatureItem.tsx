import React, { useState } from 'react'
import { Text } from 'react-native'

import SettingItem, { ListItem } from '../../components/settings/Item'
import TemperatureModal from '../temperature-records/TemperatureModal'

import { text } from '../../theme/styles'

export default ({ item, onChange }: { item: ListItem<number>, onChange: (value: number) => void }): React.ReactElement => {
  let [showModal, setShowModal] = useState(false)
  const { description, value } = item

  const sentence = description.charAt(0).toLocaleLowerCase() + description.substring(1)

  return (
    <>
      <SettingItem 
        item={item}
        onChange={() => setShowModal(true)} 
        rightView={<Text style={[text.default, text.accent]}>{value}˚</Text>}
      />
      <TemperatureModal
        visible={showModal}
        value={value}
        onValueChange={v => {
          onChange(v)
        }}
        onClose={() => setShowModal(false)}
      >
        Select the {sentence}
      </TemperatureModal>
    </>
  )
}