
import React, { useState } from 'react';
import { StagingStyle } from '../types';
import { STYLE_CONFIGS } from '../constants';

interface StylePickerProps {
  selected: StagingStyle;
  onSelect: (style: StagingStyle) => void;
  disabled: boolean;
}

// Group styles by category for better organization
const STYLE_CATEGORIES: { name: string; styles: StagingStyle[] }[] = [
  {
    name: 'Popular',
    styles: [StagingStyle.MODERN, StagingStyle.TRANSITIONAL, StagingStyle.MINIMALIST, StagingStyle.FARMHOUSE]
  },
  {
    name: 'Classic',
    styles: [StagingStyle.TRADITIONAL, StagingStyle.RUSTIC, StagingStyle.SCANDINAVIAN, StagingStyle.MID_CENTURY_MODERN]
  },
  {
    name: 'Trendy',
    styles: [StagingStyle.CONTEMPORARY, StagingStyle.BOHEMIAN, StagingStyle.COASTAL, StagingStyle.ZEN]
  },
  {
    name: 'Premium',
    styles: [StagingStyle.LUXURY, StagingStyle.ART_DECO, StagingStyle.BIOPHILIC, StagingStyle.COTTAGE_CORE]
  },
  {
    name: 'Utility',
    styles: [StagingStyle.INDUSTRIAL, StagingStyle.EMPTY]
  }
];

export const StylePicker: React.FC<StylePickerProps> = ({ selected, onSelect, disabled }) => {
  const [activeCategory, setActiveCategory] = useState(
    STYLE_CATEGORIES.find(cat => cat.styles.includes(selected))?.name || 'Popular'
  );

  const currentCategoryStyles = STYLE_CATEGORIES.find(cat => cat.name === activeCategory)?.styles || [];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {STYLE_CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
              ${activeCategory === cat.name
                ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Style Grid for Active Category */}
      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-hide">
        {currentCategoryStyles.map((style) => (
          <button
            key={style}
            onClick={() => onSelect(style)}
            disabled={disabled}
            className={`
              p-3 rounded-xl text-left border-2 transition-all duration-200 group relative overflow-hidden
              ${selected === style
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {selected === style && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            )}
            <div className={`text-sm font-bold transition-colors ${selected === style ? 'text-indigo-400' : 'text-slate-200'}`}>
              {style}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wide font-medium truncate">
              {STYLE_CONFIGS[style].description.split(',')[0]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
