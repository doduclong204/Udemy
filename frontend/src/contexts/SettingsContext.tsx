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

// ── Convert HEX -> HSL cho shadcn/ui CSS variables ──
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

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

          // Inject primaryColor vào CSS variable (shadcn/ui dùng HSL)
          if (data.primaryColor) {
            const hsl = hexToHsl(data.primaryColor);
            document.documentElement.style.setProperty('--primary', hsl);
            document.documentElement.style.setProperty('--primary-foreground', '0 0% 100%');
          }

          // Cập nhật title trang
          if (data.siteName) {
            document.title = data.siteName;
          }

          // Cập nhật favicon
          if (data.favicon) {
            const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
            if (link) link.href = data.favicon;
          }
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
  }, []);

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