import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loadSettings, saveSettings } from '~/services/settings';
import { DEFAULT_SETTINGS, type UserSettings } from '~/types/settings';

type ContextValue = {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
};

const SettingsContext = createContext<ContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  function updateSettings(patch: Partial<UserSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): ContextValue {
  return useContext(SettingsContext);
}
