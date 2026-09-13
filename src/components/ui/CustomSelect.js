'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

export default function CustomSelect({
  label,
  value,
  onChange,
  options = [], // [{ value: '...', label: '...' }] or string[]
  placeholder = 'Select an option',
  required = false,
  error = null,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options
  const formattedOptions = options.map((opt) =>
    typeof opt === 'object' && opt !== null
      ? opt
      : { value: opt, label: String(opt) }
  );

  const selectedOption = formattedOptions.find((opt) => String(opt.value) === String(value));

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
          {label} {required && <span className="text-gold-700">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-xs p-3 rounded-xl border bg-white text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-champagne-50'
            : error
            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
            : isOpen
            ? 'border-gold-500 ring-2 ring-gold-500/20 shadow-glow-gold'
            : 'border-champagne-300 hover:border-gold-400'
        }`}
      >
        <span className={`truncate ${selectedOption ? 'text-obsidian-900 font-medium' : 'text-obsidian-400 font-light'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gold-700 flex-shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-gold-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/98 backdrop-blur-md border border-gold-400/50 rounded-2xl shadow-luxury-lg overflow-hidden py-1.5 animate-fadeIn max-h-60 overflow-y-auto">
          {formattedOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-obsidian-400 text-center">
              No options available
            </div>
          ) : (
            formattedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-4 py-2.5 text-xs text-left flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-gold-500/15 text-gold-900 font-semibold'
                      : 'text-obsidian-800 hover:bg-champagne-100/70'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}

      {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
