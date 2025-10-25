import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

const Settings = ({ theme, onThemeChange }: SettingsProps) => {
  return (
    <div className="h-full bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Настройки</h1>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Palette" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-medium">Персонализация</h2>
                <p className="text-sm text-muted-foreground">
                  Настройте внешний вид системы
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <Icon name={theme === 'dark' ? 'Moon' : 'Sun'} size={20} />
                  <div>
                    <Label htmlFor="theme-toggle" className="text-base cursor-pointer">
                      Темная тема
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Использовать темное оформление
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={onThemeChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Icon name="Monitor" size={24} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-medium">Система</h2>
                <p className="text-sm text-muted-foreground">
                  Информация о системе
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Версия</span>
                <span className="font-medium">Windows 11 Pro</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Сборка</span>
                <span className="font-medium">22000.1</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Процессор</span>
                <span className="font-medium">Virtual CPU</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">ОЗУ</span>
                <span className="font-medium">8 ГБ</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Icon name="HardDrive" size={24} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-medium">Хранилище</h2>
                <p className="text-sm text-muted-foreground">
                  Управление файлами и папками
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Локальный диск (C:)</span>
                  <span className="text-sm font-medium">45 ГБ / 256 ГБ</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
