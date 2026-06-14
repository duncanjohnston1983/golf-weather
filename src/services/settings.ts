import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, type UserSettings } from '~/types/settings';

const STORAGE_KEY = '@golf-weather/settings/v1';

export async function loadSettings(): Promise<UserSettings> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json === null) return DEFAULT_SETTINGS;
    const partial = JSON.parse(json) as Partial<UserSettings>;
    return { ...DEFAULT_SETTINGS, ...partial };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
