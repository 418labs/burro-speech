'use client';

import type React from 'react';

export interface SubtitleSettingsProps {
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

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, fontSize: Number.parseInt(e.target.value) });
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
      <div className='flex flex-col gap-2'>
        <label className='block text-sm font-medium mb-1'>Font: {settings.fontSize}px</label>
        <input
          type='range'
          min='16'
          max='36'
          value={settings.fontSize}
          onChange={handleFontSizeChange}
          className='w-full'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='block text-sm font-medium mb-1'>Position</label>
        <div className='flex gap-2'>
          <button
            onClick={() => handlePositionChange('top')}
            className={`px-3 py-1 rounded text-sm ${
              settings.position === 'top' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => handlePositionChange('bottom')}
            className={`px-3 py-1 rounded text-sm ${
              settings.position === 'bottom' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Bottom
          </button>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <label className='block text-sm font-medium mb-1'>Text</label>
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

      <div className='flex flex-col gap-2'>
        <label className='block text-sm font-medium mb-1'>
          Background: {Number.parseInt((Number.parseFloat(settings.backgroundColor.split(',')[3]) * 100).toString())}%
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
