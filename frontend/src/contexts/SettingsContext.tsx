import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import settingService from '@/services/settingService';
import type { SettingResponse } from '@/types';

interface SettingsContextType {
  settings: SettingResponse | null;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const data = await settingService.getSettings();
        if (isMounted) {
          setSettings(data);
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err);
        if (isMounted) {
          setError(err.message || 'Không thể tải cài đặt');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []); // Chỉ fetch 1 lần duy nhất

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings phải được dùng bên trong SettingsProvider');
  }
  return context;
}