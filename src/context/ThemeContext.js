'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import {
  THEMES_MAP,
  ALL_THEMES_LIST,
  THEME_CATEGORIES,
  applyThemeVariablesToDOM,
} from '../lib/themeRegistry';

export const THEMES = THEMES_MAP;

const ThemeContext = createContext({
  siteName: 'LUMIÈRE DECOR',
  tagline: 'Haute Scénographie & Luxury Event Decoration',
  colorTheme: 'royalGold',
  mode: 'dark', // 'dark' | 'light'
  isDarkMode: true,
  themesList: ALL_THEMES_LIST,
  categoriesList: THEME_CATEGORIES,
  activeThemeConfig: THEMES_MAP.royalGold,
  setSiteName: () => {},
  setTagline: () => {},
  setColorTheme: () => {},
  setMode: () => {},
  toggleMode: () => {},
  updateBrandAndTheme: async () => {},
});

export const ThemeProvider = ({ children }) => {
  const [siteName, setSiteNameState] = useState('LUMIÈRE DECOR');
  const [tagline, setTaglineState] = useState('Haute Scénographie & Luxury Event Decoration');
  const [colorTheme, setColorThemeState] = useState('royalGold');
  const [mode, setModeState] = useState('dark'); // 'dark' | 'light'
  const [loading, setLoading] = useState(true);

  // Apply CSS variables, mode, and theme classes dynamically to document root
  const applyThemeToDOM = (themeKey, name, currentMode) => {
    if (typeof window === 'undefined') return;
    applyThemeVariablesToDOM(themeKey);

    const activeMode = currentMode || mode;
    const root = document.documentElement;
    const body = document.body;

    if (activeMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light', 'theme-mode-light');
      root.classList.remove('theme-mode-dark');
      root.setAttribute('data-theme-mode', 'light');
      body.classList.remove('theme-mode-dark');
      body.classList.add('theme-mode-light');
    } else {
      root.classList.remove('light', 'theme-mode-light');
      root.classList.add('dark', 'theme-mode-dark');
      root.setAttribute('data-theme-mode', 'dark');
      body.classList.remove('theme-mode-light');
      body.classList.add('theme-mode-dark');
    }

    // Update document title if siteName provided
    if (name) {
      document.title = `${name} | ${tagline}`;
    }
  };

  // Fetch saved settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try local storage for instant render
        const cachedName = localStorage.getItem('lumiere_site_name');
        const cachedTheme = localStorage.getItem('lumiere_color_theme');
        const cachedTagline = localStorage.getItem('lumiere_tagline');
        const cachedMode = localStorage.getItem('lumiere_theme_mode') || 'dark';

        if (cachedName) setSiteNameState(cachedName);
        if (cachedTheme && THEMES_MAP[cachedTheme]) setColorThemeState(cachedTheme);
        if (cachedTagline) setTaglineState(cachedTagline);
        if (cachedMode === 'light' || cachedMode === 'dark') setModeState(cachedMode);

        const effectiveTheme = (cachedTheme && THEMES_MAP[cachedTheme]) ? cachedTheme : 'royalGold';
        applyThemeToDOM(effectiveTheme, cachedName, cachedMode);

        const res = await api.getSettings();
        if (res && res.settings) {
          const sName = res.settings.siteName || res.settings.site_name || 'LUMIÈRE DECOR';
          const sTheme = res.settings.colorTheme || res.settings.color_theme || 'royalGold';
          const sTagline = res.settings.tagline || 'Haute Scénographie & Luxury Event Decoration';

          setSiteNameState(sName);
          if (THEMES_MAP[sTheme]) {
            setColorThemeState(sTheme);
          }
          setTaglineState(sTagline);

          localStorage.setItem('lumiere_site_name', sName);
          localStorage.setItem('lumiere_color_theme', sTheme);
          localStorage.setItem('lumiere_tagline', sTagline);

          applyThemeToDOM(sTheme, sName, cachedMode);
        }
      } catch (e) {
        console.warn('Could not load site theme settings', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const setSiteName = (newName) => {
    setSiteNameState(newName);
    localStorage.setItem('lumiere_site_name', newName);
  };

  const setTagline = (newTagline) => {
    setTaglineState(newTagline);
    localStorage.setItem('lumiere_tagline', newTagline);
  };

  const setColorTheme = (newTheme) => {
    if (THEMES_MAP[newTheme]) {
      setColorThemeState(newTheme);
      localStorage.setItem('lumiere_color_theme', newTheme);
      applyThemeToDOM(newTheme, siteName, mode);
    }
  };

  const setMode = (newMode) => {
    const val = newMode === 'light' ? 'light' : 'dark';
    setModeState(val);
    localStorage.setItem('lumiere_theme_mode', val);
    applyThemeToDOM(colorTheme, siteName, val);
  };

  const toggleMode = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
  };

  const updateBrandAndTheme = async (newName, newTheme, newTagline) => {
    const updatedName = newName || siteName;
    const updatedTheme = newTheme || colorTheme;
    const updatedTagline = newTagline || tagline;

    setSiteNameState(updatedName);
    setColorThemeState(updatedTheme);
    setTaglineState(updatedTagline);

    localStorage.setItem('lumiere_site_name', updatedName);
    localStorage.setItem('lumiere_color_theme', updatedTheme);
    localStorage.setItem('lumiere_tagline', updatedTagline);

    applyThemeToDOM(updatedTheme, updatedName, mode);

    // Save to backend database
    await api.bulkUpdateSettings({
      siteName: updatedName,
      site_name: updatedName,
      colorTheme: updatedTheme,
      color_theme: updatedTheme,
      tagline: updatedTagline,
    });
  };

  const activeThemeConfig = THEMES_MAP[colorTheme] || THEMES_MAP.royalGold;

  return (
    <ThemeContext.Provider
      value={{
        siteName,
        tagline,
        colorTheme,
        mode,
        isDarkMode: mode === 'dark',
        themesList: ALL_THEMES_LIST,
        categoriesList: THEME_CATEGORIES,
        activeThemeConfig,
        setSiteName,
        setTagline,
        setColorTheme,
        setMode,
        toggleMode,
        updateBrandAndTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
