'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
        weekday: 'short',
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

  const isToday = (day) => {
    const now = new Date();
    return (
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day
    );
  };

  const isSelected = (day) => {
    if (!value) return false;
    return value === formatDateStr(viewYear, viewMonth, day);
  };

  // Positioning class based on align prop
  const alignmentClass =
    align === 'right'
      ? 'right-0'
      : align === 'left'
      ? 'left-0'
      : 'left-0 sm:left-0';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
          {label} {required && <span className="text-gold-700">*</span>}
        </label>
      )}

      {/* Trigger Button - Styled in Website Ivory & Gold Luxury Theme */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-xs p-2.5 sm:p-3 rounded-xl border bg-ivory-50 text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-champagne-100'
            : error
            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
            : isOpen
            ? 'border-gold-500 ring-2 ring-gold-500/20 bg-champagne-50 shadow-glow-gold'
            : 'border-champagne-300 hover:border-gold-400 hover:bg-champagne-50/70'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-gold-600 flex-shrink-0" />
          <span className={`truncate ${value ? 'text-obsidian-950 font-medium' : 'text-obsidian-400 font-light'}`}>
            {value ? getFormattedDisplay() : placeholder}
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider flex-shrink-0 ml-1">
          {isOpen ? 'Close' : 'Pick'}
        </span>
      </button>

      {/* Popover Calendar Matrix - Website Luxury Theme (No Stark White) */}
      {isOpen && (
        <div
          className={`absolute ${alignmentClass} top-full mt-2 z-[9999] bg-gradient-to-b from-ivory-50 via-champagne-50 to-ivory-100 border border-gold-500/50 rounded-2xl shadow-2xl p-3.5 sm:p-4 w-[280px] sm:w-[290px] max-w-[calc(100vw-2rem)] select-none backdrop-blur-md`}
          style={{ boxShadow: '0 20px 40px -10px rgba(20,20,20,0.3), 0 0 20px rgba(212,175,55,0.25)' }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-champagne-300/80 bg-champagne-100/50 rounded-xl px-2 py-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-champagne-200 text-obsidian-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif text-sm font-semibold text-obsidian-950 flex items-center space-x-1.5">
              <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-champagne-200 text-obsidian-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[10px] uppercase font-bold tracking-wider text-gold-700">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7 sm:h-8 sm:w-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const disabledDay = isDayDisabled(day);
              const selectedDay = isSelected(day);
              const todayDay = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={(e) => handleDayClick(day, e)}
                  className={`h-7 w-7 sm:h-8 sm:w-8 mx-auto rounded-full text-xs flex items-center justify-center transition-all duration-150 ${
                    selectedDay
                      ? 'bg-gradient-to-br from-gold-600 to-champagne-500 text-obsidian-950 font-bold shadow-md scale-105 ring-1 ring-gold-600'
                      : disabledDay
                      ? 'text-obsidian-300 opacity-25 cursor-not-allowed'
                      : todayDay
                      ? 'border border-gold-500 bg-gold-500/10 text-gold-800 font-bold hover:bg-gold-500/20'
                      : 'text-obsidian-800 hover:bg-champagne-200 hover:text-obsidian-950'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer with Today / Clear shortcuts */}
          <div className="mt-2.5 pt-2 border-t border-champagne-300/80 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const now = new Date();
                const nowStr = formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());
                onChange(nowStr);
                setIsOpen(false);
              }}
              className="text-gold-700 font-bold hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-gold-600" />
              <span>Today</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-obsidian-500 hover:text-red-600 transition-colors font-medium text-[10px] uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
