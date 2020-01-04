/**
 * @category Containers
 * @module containers/settings
 * @packageDocumentation
 */
import React, { useState } from 'react'
import { Text } from 'react-native'

import SettingItem, { ListItem } from 'components/settings/Item'
import TemperatureModal from '../temperature-records/TemperatureModal'

import { text } from 'theme/styles'

interface TemperatureItemProps {
  item: ListItem<number>
  onChange: (value: string | number) => void
}

/**
 * An Item for `SettingsList`, for temperature settings\
 * Shows the settings value as a temperature on the right.\
 * Triggers a Modal to edit the value on press.
 */
export default function TemperatureItem(props: TemperatureItemProps): React.ReactElement {
  const { item, onChange } = props
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