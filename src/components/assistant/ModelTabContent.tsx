import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { ChevronRight } from '@tamagui/lucide-icons'
import { MotiView } from 'moti'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Text, XStack } from 'tamagui'

import { SettingGroup, SettingRow } from '@/components/settings'
import { isReasoningModel } from '@/config/models/reasoning'
import { Assistant, AssistantSettings, Model } from '@/types/assistant'
import { useIsDark } from '@/utils'

import ModelSheet from '../sheets/ModelSheet'
import { CustomSlider } from '../ui/CustomSlider'
import { CustomSwitch } from '../ui/Switch'
import { ReasoningSelect } from './ReasoningSelect'

interface ModelTabContentProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

export function ModelTabContent({ assistant, updateAssistant }: ModelTabContentProps) {
  const { t } = useTranslation()
  const isDark = useIsDark()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [model, setModel] = useState<Model[]>(assistant?.model ? [assistant.model] : [])
  const isReasoning = isReasoningModel(assistant?.model)

  useEffect(() => {
    updateAssistant({
      ...assistant,
      model: model[0]
    })
  })

  const handleSettingsChange = (key: keyof AssistantSettings, value: any) => {
    updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        [key]: value
      }
    })
  }

  const handleMaxTokensChange = (value: string) => {
    if (value.trim() === '') {
      handleSettingsChange('maxTokens', undefined)
      return
    }

    const numValue = parseInt(value, 10)

    if (!isNaN(numValue) && numValue > 0) {
      handleSettingsChange('maxTokens', numValue)
    }
  }

  const handlePress = () => {
    bottomSheetModalRef.current?.present()
  }

  const settings = assistant.settings || {}

  return (
    <MotiView
      style={{ flex: 1, gap: 30 }}
      from={{ opacity: 0, translateY: 10 }}
      animate={{
        translateY: 0,
        opacity: 1
      }}
      exit={{ opacity: 1, translateY: -10 }}
      transition={{
        type: 'timing'
      }}>
      <SettingGroup>
        <SettingRow>
          <Button
            chromeless
            width="100%"
            height="100%"
            paddingHorizontal={16}
            paddingVertical={15}
            iconAfter={<ChevronRight size={16} />}
            backgroundColor={isDark ? '$uiCardDark' : '$uiCardLight'}
            onPress={handlePress}>
            <XStack flex={1} alignItems="center" overflow="hidden" justifyContent="space-between">
              {model.length > 0 ? (
                <>
                  <Text flexShrink={1} numberOfLines={1} ellipsizeMode="tail">
                    {t(`provider.${model[0].provider}`)}
                  </Text>
                  <Text flexShrink={0} numberOfLines={1} maxWidth="60%" ellipsizeMode="tail">
                    {model[0].name}
                  </Text>
                </>
              ) : (
                <Text flex={1} numberOfLines={1} ellipsizeMode="tail">
                  {t('settings.models.empty')}
                </Text>
              )}
            </XStack>
          </Button>
        </SettingRow>
        <SettingRow>
          <CustomSlider
            label={t('assistants.settings.temperature')}
            value={settings.temperature ?? 0.7}
            max={10}
            multiplier={10}
            onValueChange={value => handleSettingsChange('temperature', value[0] / 10)}
          />
        </SettingRow>
        <SettingRow>
          <CustomSlider
            label={t('assistants.settings.top_p')}
            value={settings.topP ?? 0.8}
            max={10}
            multiplier={10}
            onValueChange={value => handleSettingsChange('topP', value[0] / 10)}
          />
        </SettingRow>
        <SettingRow>
          <CustomSlider
            label={t('assistants.settings.context')}
            value={settings.contextCount ?? 15}
            max={30}
            onValueChange={value => handleSettingsChange('contextCount', value[0])}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingRow>
          <Text>{t('assistants.settings.stream_output')}</Text>
          <CustomSwitch
            checked={settings.streamOutput ?? false}
            onCheckedChange={checked => handleSettingsChange('streamOutput', checked)}
          />
        </SettingRow>
        <SettingRow>
          <Text>{t('assistants.settings.max_tokens')}</Text>
          <CustomSwitch
            checked={settings.enableMaxTokens ?? false}
            onCheckedChange={checked => handleSettingsChange('enableMaxTokens', checked)}
          />
        </SettingRow>
        {settings.enableMaxTokens && (
          <SettingRow>
            <Text>{t('assistants.settings.max_tokens_value')}</Text>
            <Input
              minWidth={80}
              height={25}
              fontSize={12}
              value={settings.maxTokens ? settings.maxTokens.toString() : ''}
              onChangeText={handleMaxTokensChange}
              keyboardType="numeric"
            />
          </SettingRow>
        )}
        {isReasoning && (
          <SettingRow>
            <Text>{t('assistants.settings.reasoning')}</Text>
            <ReasoningSelect assistant={assistant} updateAssistant={updateAssistant} />
          </SettingRow>
        )}
      </SettingGroup>
      <ModelSheet ref={bottomSheetModalRef} mentions={model} setMentions={setModel} multiple={false} />
    </MotiView>
  )
}
