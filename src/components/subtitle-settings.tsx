'use client';

import type React from 'react';
import { AArrowDown, AArrowUp, AlignEndHorizontal, AlignStartHorizontal, Minus, Plus } from 'lucide-react';

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

  const backgroundValue = Number.parseFloat(settings.backgroundColor.split(',')[3]);

  return (
    <div className='flex flex-col bg-black/85 backdrop-blur-md text-white'>
      {/* Position */}
      <div className='flex items-center gap-2 p-2'>
        <div className='flex flex-col flex-1'>
          <h3 className=''>Position</h3>
          <span className='text-sm text-muted-foreground'>{settings.position === 'top' ? 'Top' : 'Bottom'}</span>
        </div>
        <div className='overflow-hidden flex gap-[1px] h-auto rounded-lg'>
          <button
            onClick={() => handlePositionChange('top')}
            className={`flex justify-center items-center h-10 w-10 ${
              settings.position === 'top' ? 'bg-white/30 text-white' : 'bg-white/10 text-white hover:bg-white/25'
            }`}
          >
            <AlignStartHorizontal size={18} />
          </button>
          <button
            onClick={() => handlePositionChange('bottom')}
            className={`flex justify-center items-center h-10 w-10 ${
              settings.position === 'bottom' ? 'bg-white/30 text-white' : 'bg-white/10 text-white hover:bg-white/25'
            }`}
          >
            <AlignEndHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Background */}
      <div className='flex items-center gap-2 p-2'>
        <div className='flex flex-col flex-1'>
          <h3 className=''>Background</h3>
          <span className='text-sm text-muted-foreground'>{Number.parseInt((backgroundValue * 100).toString())}%</span>
        </div>
        <div className='overflow-hidden flex gap-[1px] rounded-lg '>
          <button
            className={`flex justify-center items-center h-10 w-10 bg-white/10 text-white hover:bg-white/25 disabled:hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed`}
            disabled={backgroundValue === 0.25}
            onClick={() => {
              handleBgOpacityChange(backgroundValue - 0.25);
            }}
          >
            <Minus size={18} />
          </button>
          <button
            className={`flex justify-center items-center h-10 w-10 bg-white/10 text-white hover:bg-white/25 disabled:hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed`}
            disabled={backgroundValue === 1}
            onClick={() => {
              handleBgOpacityChange(backgroundValue + 0.25);
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Font */}
      <div className='flex items-center gap-2 p-2'>
        <div className='flex flex-col flex-1'>
          <h3 className=''>Font</h3>
          <span className='text-sm text-muted-foreground capitalize'>{settings.fontSize}px</span>
        </div>
        <div className='overflow-hidden flex gap-[1px] rounded-lg'>
          <button
            className={`flex justify-center items-center h-10 w-10 bg-white/10 text-white hover:bg-white/25 disabled:hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed`}
            disabled={settings.fontSize === 16}
            onClick={() => {
              handleFontSizeChange({ target: { value: settings.fontSize - 4 } } as any);
            }}
          >
            <AArrowDown size={18} />
          </button>
          <button
            className={`flex justify-center items-center h-10 w-10 bg-white/10 text-white hover:bg-white/25 disabled:hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed`}
            disabled={settings.fontSize === 36}
            onClick={() => {
              handleFontSizeChange({ target: { value: settings.fontSize + 4 } } as any);
            }}
          >
            <AArrowUp size={18} />
          </button>
        </div>
      </div>

      {/* Color */}
      <div className='flex items-center gap-2 p-2'>
        <div className='flex flex-col flex-1'>
          <h3 className=''>Color</h3>
          <span className='text-sm text-muted-foreground capitalize'>{settings.textColor}</span>
        </div>
        <div className='overflow-hidden flex gap-[1px] rounded-lg'>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleTextColorChange(color)}
              className={`flex justify-center items-center h-10 w-10 ${
                settings.textColor === color ? 'bg-white/30 text-white' : 'bg-white/10 text-white hover:bg-white/25'
              }`}
              aria-label={`Color ${color}`}
            >
              <div className={`w-5 h-5 rounded-full`} style={{ backgroundColor: color }}></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
