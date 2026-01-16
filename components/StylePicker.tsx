
import React from 'react';
import { StagingStyle } from '../types';
import { STYLE_CONFIGS } from '../constants';

interface StylePickerProps {
  selected: StagingStyle;
  onSelect: (style: StagingStyle) => void;
  disabled: boolean;
}

export const StylePicker: React.FC<StylePickerProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.values(StagingStyle).map((style) => (
        <button
          key={style}
          onClick={() => onSelect(style)}
          disabled={disabled}
          className={`
            p-4 rounded-2xl text-left border-2 transition-all duration-300 group relative overflow-hidden
            ${selected === style 
              ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
              : 'border-slate-800 bg-slate-900 hover:border-slate-600'}
            disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1
          `}
        >
          {selected === style && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          )}
          <div className={`font-bold transition-colors ${selected === style ? 'text-indigo-400' : 'text-slate-200'}`}>
            {style}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
            {STYLE_CONFIGS[style].description.split(',')[0]}
          </div>
        </button>
      ))}
    </div>
  );
};
