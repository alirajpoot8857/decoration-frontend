import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, Check, Sparkles, Compass, Loader2, Building, Flag } from 'lucide-react';
import { searchPakistanLocations, PAKISTAN_MAJOR_CITIES } from '../../lib/pakistanLocations';
import { useTheme } from '../../context/ThemeContext';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const TOP_PAKISTAN_CITIES = [
  { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
  { name: 'Faisalabad', lat: 31.4504, lng: 73.1350 },
  { name: 'Multan', lat: 30.1575, lng: 71.5249 },
  { name: 'Gujranwala', lat: 32.1877, lng: 74.1945 },
  { name: 'Sialkot', lat: 32.4945, lng: 74.5229 },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
  { name: 'Hyderabad', lat: 25.3960, lng: 68.3578 },
  { name: 'Abbottabad', lat: 34.1688, lng: 73.2215 },
  { name: 'Swat / Mingora', lat: 34.7717, lng: 72.3600 },
  { name: 'Bahawalpur', lat: 29.3544, lng: 71.6911 },
  { name: 'Sargodha', lat: 32.0836, lng: 72.6711 },
  { name: 'Mirpur (AJK)', lat: 33.1484, lng: 73.7519 },
  { name: 'Gilgit (GB)', lat: 35.9221, lng: 74.3087 },
  { name: 'Gwadar', lat: 25.1264, lng: 62.3225 },
];

export default function LocationPicker({
  label = 'Event Venue / Delivery Location',
  value = '',
  onChange,
  placeholder = 'Search any city, sector, marquee, or venue in Pakistan...',
  required = false,
  error = null,
  autoDetect = true,
  className = '',
}) {
  const { isDarkMode } = useTheme();
  const [detecting, setDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');
  const [mapModalOpen, setMapModalOpen] = useState(false);
  useBodyScrollLock(mapModalOpen);
  const [coords, setCoords] = useState({ lat: 31.5204, lng: 74.3587 }); // Default to Lahore
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMapAddress, setSelectedMapAddress] = useState(value || '');
  const [geocoding, setGeocoding] = useState(false);
  const [inlineSuggestionsOpen, setInlineSuggestionsOpen] = useState(false);

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Auto-detect location on mount if value is empty and autoDetect is true
  useEffect(() => {
    if (autoDetect && !value && typeof window !== 'undefined' && 'geolocation' in navigator) {
      handleDetectLocation(false);
    }
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value && value !== selectedMapAddress) {
      setSelectedMapAddress(value);
    }
  }, [value]);

  // Reverse geocode lat/lng to readable address via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lon) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const address = data.address || {};
          const building = address.amenity || address.building || address.leisure || address.hotel || '';
          const road = address.road || address.pedestrian || address.street || '';
          const suburb = address.suburb || address.neighbourhood || address.residential || '';
          const city = address.city || address.town || address.village || address.county || 'Pakistan';
          const state = address.state || '';

          const parts = [building, road, suburb, city, state].filter(Boolean);
          const formatted = parts.length > 0 ? parts.join(', ') : data.display_name;

          return { full: formatted, city };
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setGeocoding(false);
    }
    return { full: `Pakistan (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`, city: 'Pakistan' };
  };

  // Multi-tier IP-based Geolocation Fallback for Desktop & WiFi users
  const detectLocationViaIP = async () => {
    // 1. Try ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const city = data.city || data.region || 'Pakistan';
          const address = `${city}, ${data.region ? data.region + ', ' : ''}Pakistan`;
          return {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            city,
            full: address,
          };
        }
      }
    } catch (e) {
      // try next
    }

    // 2. Try freeipapi.com
    try {
      const res2 = await fetch('https://freeipapi.com/api/json', { cache: 'no-store' });
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.latitude && data2.longitude) {
          const city = data2.cityName || 'Pakistan';
          const address = `${city}, ${data2.regionName ? data2.regionName + ', ' : ''}Pakistan`;
          return {
            lat: parseFloat(data2.latitude),
            lng: parseFloat(data2.longitude),
            city,
            full: address,
          };
        }
      }
    } catch (e2) {
      // try next
    }

    // 3. Try BigDataCloud
    try {
      const res3 = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', { cache: 'no-store' });
      if (res3.ok) {
        const data3 = await res3.json();
        if (data3 && data3.latitude && data3.longitude) {
          const city = data3.city || data3.locality || 'Pakistan';
          const address = `${city}, ${data3.principalSubdivision ? data3.principalSubdivision + ', ' : ''}Pakistan`;
          return {
            lat: parseFloat(data3.latitude),
            lng: parseFloat(data3.longitude),
            city,
            full: address,
          };
        }
      }
    } catch (e3) {
      // ignore
    }

    return null;
  };

  const handleDetectLocation = async (showErrors = true) => {
    setDetecting(true);

    const applyLocation = (lat, lng, fullAddress, cityName) => {
      setCoords({ lat, lng });
      setDetectedCity(cityName || 'Pakistan');
      setSelectedMapAddress(fullAddress);
      if (onChange) onChange(fullAddress);
      setDetecting(false);

      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1.0 });
        } catch (e) {
          leafletMapRef.current.setView([lat, lng], 15);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
      }
    };

    // First try browser native geolocation with fast 3.5s timeout
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      let resolved = false;

      const geoTimeout = setTimeout(async () => {
        if (!resolved) {
          resolved = true;
          const ipLoc = await detectLocationViaIP();
          if (ipLoc) {
            applyLocation(ipLoc.lat, ipLoc.lng, ipLoc.full, ipLoc.city);
          } else {
            applyLocation(31.5204, 74.3587, 'Gulberg III, Lahore, Punjab, Pakistan', 'Lahore');
          }
        }
      }, 3500);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(geoTimeout);
          const { latitude, longitude } = pos.coords;
          const geo = await reverseGeocode(latitude, longitude);
          applyLocation(latitude, longitude, geo.full, geo.city);
        },
        async (err) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(geoTimeout);
          console.warn('Browser GPS unavailable, switching to IP Geolocation:', err?.message);
          const ipLoc = await detectLocationViaIP();
          if (ipLoc) {
            applyLocation(ipLoc.lat, ipLoc.lng, ipLoc.full, ipLoc.city);
          } else {
            applyLocation(31.5204, 74.3587, 'Gulberg III, Lahore, Punjab, Pakistan', 'Lahore');
          }
        },
        { timeout: 3000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    } else {
      const ipLoc = await detectLocationViaIP();
      if (ipLoc) {
        applyLocation(ipLoc.lat, ipLoc.lng, ipLoc.full, ipLoc.city);
      } else {
        applyLocation(31.5204, 74.3587, 'Gulberg III, Lahore, Punjab, Pakistan', 'Lahore');
      }
    }
  };

  // High-performance search handler using 250+ Pakistan database + Photon + Nominatim
  const performSearch = async (q) => {
    if (!q || q.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchPakistanLocations(q);
      setSearchResults(results || []);
    } catch (err) {
      console.warn('Pakistan search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Live debounce effect for search query
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle explicit form submission
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const results = await searchPakistanLocations(searchQuery);
    setSearchResults(results || []);
    setSearching(false);

    if (results && results.length > 0) {
      handleSelectSearchResult(results[0]);
    }
  };

  // Selecting a search result
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (isNaN(lat) || isNaN(lon)) return;

    const newCoords = { lat, lng: lon };
    setCoords(newCoords);
    setSelectedMapAddress(result.display_name);
    setSearchResults([]);
    setInlineSuggestionsOpen(false);
    setSearchQuery(result.name || result.display_name.split(',')[0]);

    if (onChange) {
      onChange(result.display_name);
    }

    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.flyTo([lat, lon], 15, { animate: true, duration: 1.2 });
      } catch (err) {
        leafletMapRef.current.setView([lat, lon], 15);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      }
    }
  };

  // Selecting a top city preset chip
  const handleSelectCityChip = async (city) => {
    setCoords({ lat: city.lat, lng: city.lng });
    setSearchQuery(city.name);

    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.flyTo([city.lat, city.lng], 14, { animate: true, duration: 1.0 });
      } catch (err) {
        leafletMapRef.current.setView([city.lat, city.lng], 14);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([city.lat, city.lng]);
      }
    }

    const res = await reverseGeocode(city.lat, city.lng);
    setSelectedMapAddress(res.full);
    if (onChange) onChange(res.full);
  };

  const handleConfirmMapLocation = () => {
    if (selectedMapAddress && onChange) {
      onChange(selectedMapAddress);
    }
    setMapModalOpen(false);
  };

  // Initialize interactive Leaflet map inside modal
  useEffect(() => {
    if (!mapModalOpen) {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      // Dynamically load Leaflet CSS and JS if not already on page
      if (!window.L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        await new Promise((resolve) => {
          if (window.L) return resolve();
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current) return;

      const L = window.L;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
      });

      // CartoDB Voyager / OpenStreetMap luxury tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom Gold Pin Marker
      const goldIcon = L.divIcon({
        className: 'custom-gold-marker',
        html: `
          <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <svg width="34" height="44" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));">
              <path d="M16 0C7.16344 0 0 7.16344 0 16C0 26.5 16 42 16 42C16 42 32 26.5 32 16C32 7.16344 24.8366 0 16 0Z" fill="#E5A83B"/>
              <circle cx="16" cy="16" r="7" fill="#0A0A0A"/>
              <circle cx="16" cy="16" r="3.5" fill="#E5A83B"/>
            </svg>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: goldIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;
      leafletMapRef.current = map;

      // Handle marker drag end to update coordinates and reverse-geocode
      marker.on('dragend', async (event) => {
        const position = event.target.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        const geo = await reverseGeocode(position.lat, position.lng);
        setSelectedMapAddress(geo.full);
      });

      // Handle click anywhere on the map to reposition pin
      map.on('click', async (event) => {
        const { lat, lng } = event.latlng;
        setCoords({ lat, lng });
        marker.setLatLng([lat, lng]);
        const geo = await reverseGeocode(lat, lng);
        setSelectedMapAddress(geo.full);
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };

    const timer = setTimeout(initMap, 60);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mapModalOpen]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className={`block text-xs uppercase tracking-wider font-semibold ${
            isDarkMode ? 'text-gold-400' : 'text-gold-800'
          }`}>
            {label} {required && <span className="text-gold-500">*</span>}
          </label>
          {detectedCity && (
            <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GPS: {detectedCity}</span>
            </span>
          )}
        </div>
      )}

      {/* Input container with Live Autocomplete + GPS + Interactive Map buttons */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-500 flex items-center pointer-events-none">
            <MapPin className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              if (onChange) onChange(val);
              setSearchQuery(val);
              setInlineSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (value && searchResults.length > 0) {
                setInlineSuggestionsOpen(true);
              }
            }}
            placeholder={placeholder}
            className={`w-full pl-10 pr-24 py-2.5 sm:py-3 text-xs rounded-xl border focus:outline-none transition-all duration-200 ${
              error
                ? 'border-red-500 focus:border-red-600 ring-2 ring-red-500/20'
                : isDarkMode
                ? 'bg-[#111116] text-ivory-50 placeholder:text-champagne-400/40 border-gold-500/35 focus:border-gold-400'
                : 'bg-white text-obsidian-950 placeholder:text-champagne-600/50 border-champagne-300 focus:border-gold-500 shadow-sm'
            } ${isDarkMode ? 'bg-[#111116]' : 'bg-white'}`}
          />

          {/* Action icons on right of input */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
            {/* 1. Quick GPS Detect Button */}
            <button
              type="button"
              onClick={() => handleDetectLocation(true)}
              title="Auto-detect current location in Pakistan"
              className="p-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500 hover:text-obsidian-950 text-gold-400 border border-gold-500/30 transition-all flex items-center space-x-1 text-[10px] font-semibold"
            >
              <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin text-gold-400' : ''}`} />
              <span className="hidden sm:inline">{detecting ? 'Locating...' : 'GPS'}</span>
            </button>

            {/* 2. Interactive Map Picker Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedMapAddress(value || selectedMapAddress);
                setSearchQuery(value || '');
                setMapModalOpen(true);
              }}
              title="Open Interactive Pakistan Map"
              className="p-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 hover:scale-105 transition-all flex items-center space-x-1 text-[10px] font-bold shadow-md"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>

        {/* Inline Live Autocomplete Dropdown */}
        {!mapModalOpen && inlineSuggestionsOpen && searchResults.length > 0 && (
          <div className={`absolute top-full left-0 right-0 mt-1 border rounded-2xl shadow-2xl divide-y max-h-56 overflow-y-auto z-50 ${
            isDarkMode
              ? 'bg-[#12121A] border-gold-500/50 divide-gold-500/15 text-ivory-50'
              : 'bg-white border-champagne-300 divide-champagne-100 text-[#141210]'
          }`}>
            <div className={`p-2 text-[10px] uppercase tracking-wider font-semibold text-gold-500 flex items-center justify-between ${
              isDarkMode ? 'bg-[#171722]' : 'bg-[#FAF7F2]'
            }`}>
              <span>Matching Pakistan Locations ({searchResults.length})</span>
              <button
                type="button"
                onClick={() => setInlineSuggestionsOpen(false)}
                className={isDarkMode ? 'text-ivory-400 hover:text-ivory-100' : 'text-obsidian-400 hover:text-obsidian-800'}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className={`w-full text-left p-2.5 text-xs flex items-center justify-between space-x-2 transition-colors ${
                  isDarkMode
                    ? 'text-ivory-100 hover:bg-gold-500/20'
                    : 'text-[#141210] hover:bg-champagne-100/70'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isDarkMode ? 'text-ivory-50' : 'text-[#141210]'}`}>{item.name || item.display_name}</p>
                    {item.state && <p className={`text-[10px] ${isDarkMode ? 'text-champagne-400/70' : 'text-[#52473A]'}`}>{item.state}, Pakistan</p>}
                  </div>
                </div>
                {item.type && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-medium bg-gold-500/15 text-gold-500 border border-gold-500/30">
                    {item.type}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}

      {/* ========================================================================= */}
      {/* LUXURY INTERACTIVE PAKISTAN MAP SELECTION MODAL                           */}
      {/* ========================================================================= */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-2 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div
            className={`relative border rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col space-y-3.5 p-4 sm:p-6 select-none transition-colors overflow-y-auto overscroll-contain ${
              isDarkMode
                ? 'bg-[#0E0E14] text-ivory-50 border-gold-500/50'
                : 'bg-white text-[#141210] border-gold-500/40'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-gradient-to-br from-gold-500 to-amber-500 text-obsidian-950 rounded-xl shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-medium flex items-center space-x-2">
                    <span>Pakistan Venue & Destination Map 🇵🇰</span>
                  </h3>
                  <p className={`text-[11px] font-light ${isDarkMode ? 'text-champagne-300/80' : 'text-[#52473A]'}`}>
                    Search every city, sector, marquee, or hotel in Pakistan, or drag the gold pin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMapModalOpen(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-white/10 text-champagne-300' : 'hover:bg-champagne-100 text-obsidian-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Search Bar inside Map Modal */}
            <div className="space-y-2">
              <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gold-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Lahore, Karachi, Islamabad, Abbottabad, Swat, DHA, Serena..."
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-gold-500 ${
                      isDarkMode
                        ? 'bg-[#161620] text-ivory-50 border-gold-500/35 placeholder:text-champagne-400/40'
                        : 'bg-[#FAF7F2] text-[#141210] border-champagne-300 placeholder:text-champagne-600/50'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? 'text-champagne-400 hover:text-ivory-50' : 'text-obsidian-400 hover:text-obsidian-800'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2 btn-festivity-pill rounded-xl text-xs uppercase font-bold tracking-wider transition-all shadow-md flex items-center space-x-1.5 shrink-0"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-obsidian-950" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 text-obsidian-950" />
                      <span>Search</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDetectLocation(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-colors shrink-0 ${
                    isDarkMode
                      ? 'bg-[#1A1A24] hover:bg-gold-500 hover:text-obsidian-950 text-gold-300 border-gold-500/30'
                      : 'bg-[#FAF7F2] hover:bg-gold-500 hover:text-obsidian-950 text-gold-800 border-champagne-300'
                  }`}
                  title="Detect GPS"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">GPS</span>
                </button>
              </form>

              {/* Suggestions Dropdown inside Map Modal */}
              {searchResults.length > 0 && (
                <div className={`border-2 rounded-xl shadow-2xl divide-y max-h-48 overflow-y-auto z-20 ${
                  isDarkMode
                    ? 'bg-[#14141E] border-gold-500/60 divide-gold-500/20 text-ivory-50'
                    : 'bg-white border-gold-500/50 divide-champagne-100 text-[#141210]'
                }`}>
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className={`w-full text-left p-2.5 text-xs flex items-center justify-between space-x-2 transition-colors ${
                        isDarkMode ? 'hover:bg-gold-500/25 text-ivory-100' : 'hover:bg-champagne-100 text-[#141210]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <span className="truncate font-medium">{item.display_name}</span>
                      </div>
                      {item.type && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-medium bg-gold-500/20 text-gold-500 border border-gold-500/30">
                          {item.type}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Leaflet Map Canvas */}
            <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-gold-500/40 shadow-inner bg-[#101015]">
              <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

              {/* Coordinates Badge */}
              <div className="absolute top-2.5 right-2.5 bg-obsidian-950/90 text-gold-300 text-[10px] px-3 py-1 rounded-full border border-gold-500/50 backdrop-blur-md shadow-md font-mono z-[500] flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span>
                  {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                </span>
              </div>

              {/* Instructions Overlay Banner */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-obsidian-950/85 backdrop-blur-md text-ivory-200 text-[10px] sm:text-xs py-1.5 px-3 rounded-xl border border-gold-500/30 flex items-center justify-between z-[500] pointer-events-none">
                <div className="flex items-center space-x-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span className="truncate">Click map or drag the gold pin to select exact venue</span>
                </div>
                {geocoding && <span className="text-gold-400 animate-pulse shrink-0 ml-2">Resolving location...</span>}
              </div>
            </div>

            {/* Dynamic Selected Address Preview */}
            <div className={`p-3 border rounded-2xl space-y-1 ${
              isDarkMode ? 'bg-[#14141E] border-gold-500/30' : 'bg-[#FAF7F2] border-champagne-300'
            }`}>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gold-500 font-semibold">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>Pinned Destination:</span>
                </span>
                {geocoding && <span className="text-gold-400">Resolving street details...</span>}
              </div>
              <p className={`text-xs font-medium line-clamp-2 ${isDarkMode ? 'text-ivory-100' : 'text-[#141210]'}`}>
                {selectedMapAddress || 'Click anywhere on the Pakistan map to set coordinates...'}
              </p>
            </div>

            {/* Popular Pakistan Metro Presets */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-gold-500 font-semibold flex items-center space-x-1">
                <Flag className="w-3 h-3 text-gold-500" />
                <span>Quick Pakistan Metro Jumper:</span>
              </div>
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {TOP_PAKISTAN_CITIES.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelectCityChip(city)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                      isDarkMode
                        ? 'bg-[#181824] hover:bg-gold-500 hover:text-obsidian-950 text-ivory-300 border border-gold-500/25'
                        : 'bg-[#FAF7F2] hover:bg-gold-500 hover:text-obsidian-950 text-[#3D352A] border border-champagne-300'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-gold-500/20">
              <button
                type="button"
                onClick={() => setMapModalOpen(false)}
                className={`px-5 py-2 rounded-full border text-xs font-semibold transition-colors ${
                  isDarkMode ? 'border-gold-500/30 text-champagne-300 hover:bg-white/5' : 'border-champagne-400 text-obsidian-700 hover:bg-champagne-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                className="px-6 py-2.5 rounded-full btn-festivity-pill text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center space-x-1.5 hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Venue Location</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
