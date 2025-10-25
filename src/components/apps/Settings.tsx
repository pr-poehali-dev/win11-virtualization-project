import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

type SettingsPage = 'main' | 'personalization' | 'system' | 'storage';

const Settings = ({ theme, onThemeChange }: SettingsProps) => {
  const [currentPage, setCurrentPage] = useState<SettingsPage>('main');

  const menuItems = [
    { id: 'personalization' as SettingsPage, icon: 'Palette', title: 'Персонализация', color: 'bg-primary/10 text-primary' },
    { id: 'system' as SettingsPage, icon: 'Monitor', title: 'О системе', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'storage' as SettingsPage, icon: 'HardDrive', title: 'Хранилище', color: 'bg-green-500/10 text-green-500' },
  ];

  const renderMainPage = () => (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold mb-8">Настройки</h1>
      {menuItems.map(item => (
        <Button
          key={item.id}
          variant="ghost"
          className="w-full h-auto p-6 justify-start hover:bg-accent/50"
          onClick={() => setCurrentPage(item.id)}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center`}>
              <Icon name={item.icon} size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.id === 'personalization' && 'Настройте внешний вид системы'}
                {item.id === 'system' && 'Информация о системе'}
                {item.id === 'storage' && 'Управление файлами и папками'}
              </p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );

  const renderPersonalizationPage = () => (
    <div>
      <Button variant="ghost" className="mb-6" onClick={() => setCurrentPage('main')}>
        <Icon name="ChevronLeft" className="mr-2" size={16} />
        Назад
      </Button>
      <h1 className="text-3xl font-semibold mb-8">Персонализация</h1>
      <div className="bg-card p-6 rounded-lg border border-border">
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
    </div>
  );

  const renderSystemPage = () => (
    <div>
      <Button variant="ghost" className="mb-6" onClick={() => setCurrentPage('main')}>
        <Icon name="ChevronLeft" className="mr-2" size={16} />
        Назад
      </Button>
      <h1 className="text-3xl font-semibold mb-8">О системе</h1>
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Операционная система</span>
            <span className="font-medium">Browser OS</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Версия</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Сборка</span>
            <span className="font-medium">2025.10.25</span>
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
    </div>
  );

  const renderStoragePage = () => (
    <div>
      <Button variant="ghost" className="mb-6" onClick={() => setCurrentPage('main')}>
        <Icon name="ChevronLeft" className="mr-2" size={16} />
        Назад
      </Button>
      <h1 className="text-3xl font-semibold mb-8">Хранилище</h1>
      <div className="bg-card p-6 rounded-lg border border-border">
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
          <div className="pt-4 mt-4 border-t border-border">
            <h3 className="font-medium mb-3">Использование места</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Документы</span>
                <span>12 ГБ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Система</span>
                <span>25 ГБ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прочее</span>
                <span>8 ГБ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-background p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        {currentPage === 'main' && renderMainPage()}
        {currentPage === 'personalization' && renderPersonalizationPage()}
        {currentPage === 'system' && renderSystemPage()}
        {currentPage === 'storage' && renderStoragePage()}
      </div>
    </div>
  );
};

export default Settings;
