'use client';

import { Plus, Minus } from 'lucide-react';

interface SubtitleSettingsProps {
  settings: {
    fontSize: number;
    position: string;
    textColor: string;
    backgroundColor: string;
  };
  onChange: (settings: any) => void;
}

export function SubtitleSettings({ settings, onChange }: SubtitleSettingsProps) {
  const colors = ['white', 'yellow', 'cyan', 'lime'];
  const bgOpacities = [0.3, 0.5, 0.7, 0.9];

  const decreaseFontSize = () => {
    if (settings.fontSize > 16) {
      onChange({ ...settings, fontSize: settings.fontSize - 2 });
    }
  };

  const increaseFontSize = () => {
    if (settings.fontSize < 36) {
      onChange({ ...settings, fontSize: settings.fontSize + 2 });
    }
  };

  const handlePositionChange = (position: string) => {
    onChange({ ...settings, position });
  };

  const handleTextColorChange = (color: string) => {
    onChange({ ...settings, textColor: color });
  };

  const handleBgOpacityChange = (opacity: number) => {
    const bgColor = `rgba(0, 0, 0, ${opacity})`;
    onChange({ ...settings, backgroundColor: bgColor });
  };

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium mb-2'>Tamaño de texto: {settings.fontSize}px</label>
        <div className='flex items-center gap-3'>
          <button
            onClick={decreaseFontSize}
            className='flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            aria-label='Disminuir tamaño de texto'
            disabled={settings.fontSize <= 16}
          >
            <Minus size={18} />
          </button>

          <div className='flex-1 text-center font-medium'>A</div>

          <button
            onClick={increaseFontSize}
            className='flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            aria-label='Aumentar tamaño de texto'
            disabled={settings.fontSize >= 36}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Posición</label>
        <div className='flex gap-2'>
          <button
            onClick={() => handlePositionChange('top')}
            className={`px-3 py-1 rounded text-sm ${
              settings.position === 'top' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Superior
          </button>
          <button
            onClick={() => handlePositionChange('bottom')}
            className={`px-3 py-1 rounded text-sm ${
              settings.position === 'bottom' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Inferior
          </button>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Color de texto</label>
        <div className='flex gap-2'>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleTextColorChange(color)}
              className={`w-8 h-8 rounded-full border ${
                settings.textColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>
          Opacidad del fondo:{' '}
          {Number.parseInt((Number.parseFloat(settings.backgroundColor.split(',')[3]) * 100).toString())}%
        </label>
        <div className='flex gap-2'>
          {bgOpacities.map((opacity) => (
            <button
              key={opacity}
              onClick={() => handleBgOpacityChange(opacity)}
              className={`w-8 h-8 rounded border ${
                settings.backgroundColor === `rgba(0, 0, 0, ${opacity})` ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ backgroundColor: `rgba(0, 0, 0, ${opacity})` }}
              aria-label={`Opacidad ${opacity * 100}%`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
