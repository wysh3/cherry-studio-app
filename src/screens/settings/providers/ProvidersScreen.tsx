import { useNavigation } from '@react-navigation/native'
import { Plus } from '@tamagui/lucide-icons'
import debounce from 'lodash/debounce'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { ScrollView, useTheme, YStack } from 'tamagui'

import { SettingContainer, SettingGroup, SettingGroupTitle } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { EmptyModelView } from '@/components/settings/providers/EmptyModelView'
import { ProviderItem } from '@/components/settings/providers/ProviderItem'
import CustomRadialGradientBackground from '@/components/ui/CustomRadialGradientBackground'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { SearchInput } from '@/components/ui/SearchInput'
import { useAllProviders } from '@/hooks/useProviders'
import { NavigationProps } from '@/types/naviagate'

export default function ProvidersScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigation = useNavigation<NavigationProps>()

  const [inputValue, setInputValue] = useState('')

  const [filterQuery, setFilterQuery] = useState('')

  const { providers, isLoading } = useAllProviders()

  const debouncedSetQuery = debounce((query: string) => {
    setFilterQuery(query)
  }, 500)

  const handleInputChange = (text: string) => {
    setInputValue(text)

    debouncedSetQuery(text)
  }

  const displayedProviders = providers
    .filter(p => p.enabled)
    .filter(p => p.name && p.name.toLowerCase().includes(filterQuery.toLowerCase()))

  const onAddProvider = () => {
    navigation.navigate('ProviderListScreen')
  }

  if (isLoading) {
    return (
      <SafeAreaContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer
      style={{
        flex: 1,
        backgroundColor: theme.background.val
      }}>
      <HeaderBar
        title={t('settings.provider.title')}
        onBackPress={() => navigation.goBack()}
        rightButton={{
          icon: <Plus size={24} />,
          onPress: onAddProvider
        }}
      />

      <SettingContainer>
        <SearchInput placeholder={t('settings.provider.search')} value={inputValue} onChangeText={handleInputChange} />

        {providers.length === 0 ? (
          <EmptyModelView onAddModel={onAddProvider} />
        ) : (
          <YStack flex={1} gap={8} paddingVertical={8}>
            <SettingGroupTitle>{t('settings.provider.title')}</SettingGroupTitle>
            <CustomRadialGradientBackground style={{ radius: 2 }}>
              <ScrollView backgroundColor="$colorTransparent" showsVerticalScrollIndicator={false}>
                <SettingGroup>
                  {displayedProviders.map(p => (
                    <ProviderItem key={p.id} provider={p} mode="enabled" />
                  ))}
                </SettingGroup>
              </ScrollView>
            </CustomRadialGradientBackground>
          </YStack>
        )}
      </SettingContainer>
    </SafeAreaContainer>
  )
}
