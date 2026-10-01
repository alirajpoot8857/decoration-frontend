'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({
  label,
  value, // 'YYYY-MM-DD' string
  onChange, // fn(string 'YYYY-MM-DD')
  minDate = null, // 'YYYY-MM-DD' string
  maxDate = null,
  placeholder = 'Select date',
  required = false,
  error = null,
  disabled = false,
  align = 'auto', // 'auto' | 'left' | 'right'
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Parse initial view date safely
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate days in month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 for Sunday

  const formatDateStr = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayClick = (day, e) => {
    e.stopPropagation();
    if (isDayDisabled(day)) return;
    const dateStr = formatDateStr(viewYear, viewMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  // Display text formatted
  const getFormattedDisplay = () => {
    if (!value) return '';
    try {
      const d = new Date(value + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  };

  const isDayDisabled = (day) => {
    const dateStr = formatDateStr(viewYear, viewMonth, day);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isSelected = (day) => {
    if (!value) return false;
    const dateStr = formatDateStr(viewYear, viewMonth, day);
    return dateStr === value;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  // Determine popover horizontal position
  let popoverAlignClass = 'left-0';
  if (align === 'right') {
    popoverAlignClass = 'right-0';
  } else if (align === 'auto') {
    popoverAlignClass = 'left-0 sm:right-auto';
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`block text-[11px] uppercase tracking-wider font-semibold mb-1 ${
          isDarkMode ? 'text-gold-400' : 'text-gold-800'
        }`}>
          {label} {required && <span className="text-gold-500">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-xs p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : error
            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
            : isOpen
            ? 'border-gold-500 ring-2 ring-gold-500/20 shadow-glow-gold'
            : isDarkMode
            ? 'bg-[#181822] border-white/15 hover:border-gold-500/50'
            : 'bg-white border-champagne-300 hover:border-gold-400'
        } ${isDarkMode ? 'bg-[#181822]' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2 truncate">
          <CalendarIcon className="w-4 h-4 text-gold-500 flex-shrink-0" />
          <span className={`truncate ${
            value
              ? isDarkMode ? 'text-ivory-50 font-medium' : 'text-obsidian-950 font-medium'
              : isDarkMode ? 'text-champagne-400/60 font-light' : 'text-obsidian-400 font-light'
          }`}>
            {getFormattedDisplay() || placeholder}
          </span>
        </div>
        <span className="text-[10px] text-gold-500 uppercase tracking-widest font-semibold flex-shrink-0">
          Pick
        </span>
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute ${popoverAlignClass} top-full mt-2 z-[9999] p-4 rounded-2xl shadow-2xl backdrop-blur-xl border w-72 sm:w-80 animate-fadeIn select-none ${
            isDarkMode
              ? 'bg-[#0E0E14] border-gold-500/40 text-ivory-50 shadow-[0_20px_50px_rgba(0,0,0,0.9)]'
              : 'bg-[#FFFFFF] border-2 border-gold-500/40 text-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.2)]'
          }`}
        >
          {/* Header Month / Year controls */}
          <div className={`flex items-center justify-between mb-4 pb-2 border-b ${
            isDarkMode ? 'border-gold-500/20' : 'border-gold-500/25'
          }`}>
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-white/10 text-gold-400' : 'hover:bg-gold-50 text-gold-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className={`font-serif text-sm font-bold tracking-wide ${
              isDarkMode ? 'text-gold-400' : 'text-gold-700'
            }`}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className={`p-1.5 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-white/10 text-gold-400' : 'hover:bg-gold-50 text-gold-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className={`text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-gold-400/80' : 'text-stone-700 font-extrabold'
              }`}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const disabledDay = isDayDisabled(day);
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={(e) => handleDayClick(day, e)}
                  className={`h-8 w-8 mx-auto rounded-full text-xs flex items-center justify-center transition-all ${
                    disabledDay
                      ? isDarkMode ? 'text-zinc-600 cursor-not-allowed opacity-30' : 'text-stone-300 cursor-not-allowed opacity-35'
                      : selected
                      ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-md scale-105'
                      : today
                      ? isDarkMode
                        ? 'border border-gold-500 text-gold-300 font-semibold hover:bg-gold-500/20'
                        : 'border-2 border-gold-600 text-gold-800 font-bold hover:bg-gold-50 bg-gold-50/50'
                      : isDarkMode
                      ? 'text-ivory-100 hover:bg-white/10 hover:text-gold-300'
                      : 'text-stone-900 font-semibold hover:bg-gold-50 hover:text-gold-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Clear / Today Action Footer */}
          <div className={`mt-4 pt-2 border-t flex items-center justify-between text-[11px] ${
            isDarkMode ? 'border-gold-500/20' : 'border-gold-500/25'
          }`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const today = new Date();
                let dateStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
                if (minDate && dateStr < minDate) {
                  dateStr = minDate;
                }
                onChange(dateStr);
                setIsOpen(false);
              }}
              className="text-gold-600 dark:text-gold-400 hover:underline font-bold"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setIsOpen(false);
                }}
                className={`hover:underline font-medium ${isDarkMode ? 'text-champagne-400/70' : 'text-stone-600'}`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-red-600 font-semibold mt-1">{error}</p>}
    </div>
  );
}
