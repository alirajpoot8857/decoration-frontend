/**
 * LUMIÈRE ATELIER - 50+ CURATED LUXURY THEMES REGISTRY
 * Spanning Golds, Jewels, Florals, Botanicals, Modern Darks, and Soft Lights.
 */

export const THEME_CATEGORIES = [
  { id: 'ALL', name: 'All Themes', icon: '👑', count: 52 },
  { id: 'GOLDS', name: 'Golds & Metallics', icon: '🌟', count: 9 },
  { id: 'JEWELS', name: 'Jewels & Royal', icon: '💎', count: 9 },
  { id: 'FLORALS', name: 'Florals & Romance', icon: '🌹', count: 9 },
  { id: 'BOTANICALS', name: 'Botanicals & Earth', icon: '🌿', count: 9 },
  { id: 'DARKS', name: 'Modern Dark & Noir', icon: '🌙', count: 9 },
  { id: 'LIGHTS', name: 'Light & Soft Ivory', icon: '☀️', count: 7 },
];

export const RAW_THEMES = [
  // =========================================================================
  // 1. GOLDS & METALLICS (9)
  // =========================================================================
  {
    id: 'royalGold',
    name: 'Royal Gold & Obsidian',
    category: 'GOLDS',
    mode: 'DARK',
    description: 'Timeless luxury 24K gold with deep obsidian tones',
    primary: '#D4AF37',
    primaryHover: '#B38728',
    previewColor: '#D4AF37',
    goldRgb: {
      50: '253 249 238', 100: '251 240 211', 200: '245 222 159', 300: '236 200 103',
      400: '226 177 52', 500: '212 175 55', 600: '184 151 38', 700: '148 117 28',
      800: '117 90 27', 900: '95 71 25', 950: '50 37 13'
    },
    champagneRgb: {
      50: '251 248 243', 100: '245 239 235', 200: '235 221 207', 300: '223 200 178',
      400: '210 178 148', 500: '197 168 128', 600: '168 136 96', 700: '137 108 72',
      800: '106 82 53', 900: '78 58 36'
    },
  },
  {
    id: 'dubaiGold',
    name: 'Dubai Sovereign Gold',
    category: 'GOLDS',
    mode: 'DARK',
    description: 'Ultra-radiant high-carat Arabian gold with amber glow',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    previewColor: '#F59E0B',
    goldRgb: {
      50: '255 251 235', 100: '254 243 199', 200: '253 230 138', 300: '252 211 77',
      400: '251 191 36', 500: '245 158 11', 600: '217 119 6', 700: '180 83 9',
      800: '146 64 14', 900: '120 53 15', 950: '69 26 3'
    },
  },
  {
    id: 'byzantineGold',
    name: 'Byzantine Empire Gold',
    category: 'GOLDS',
    mode: 'DARK',
    description: 'Ancient regal antiqued gold with warm bronze shading',
    primary: '#EAB308',
    primaryHover: '#CA8A04',
    previewColor: '#EAB308',
    goldRgb: {
      50: '254 252 232', 100: '254 249 195', 200: '254 240 138', 300: '253 224 71',
      400: '250 204 21', 500: '234 179 8', 600: '202 138 4', 700: '161 98 7',
      800: '133 77 14', 900: '113 63 18', 950: '45 25 5'
    },
  },
  {
    id: 'antiqueBronze',
    name: 'Imperial Antique Bronze',
    category: 'GOLDS',
    mode: 'DARK',
    description: 'Rich metallic bronze with deep mahogany undertones',
    primary: '#B45309',
    primaryHover: '#92400E',
    previewColor: '#B45309',
    goldRgb: {
      50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116',
      400: '251 146 60', 500: '234 88 12', 600: '194 65 12', 700: '154 52 18',
      800: '124 45 18', 900: '99 35 15', 950: '40 14 5'
    },
  },
  {
    id: 'roseGoldDeluxe',
    name: 'Rose Gold Couture',
    category: 'GOLDS',
    mode: 'LIGHT',
    description: 'Haute couture blush silk and luminous pink gold',
    primary: '#FB7185',
    primaryHover: '#F43F5E',
    previewColor: '#FB7185',
    goldRgb: {
      50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175',
      400: '251 113 133', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60',
      800: '159 18 57', 900: '136 19 55', 950: '76 5 25'
    },
  },
  {
    id: 'platinumSilver',
    name: 'Platinum Mirror Silver',
    category: 'GOLDS',
    mode: 'DARK',
    description: 'Ultra-polished reflective mirror silver and platinum',
    primary: '#94A3B8',
    primaryHover: '#64748B',
    previewColor: '#94A3B8',
    goldRgb: {
      50: '248 250 252', 100: '241 245 249', 200: '226 232 240', 300: '203 213 225',
      400: '148 163 184', 500: '100 116 139', 600: '71 85 105', 700: '51 65 85',
      800: '30 41 59', 900: '15 23 42', 950: '8 12 24'
    },
  },
  {
    id: 'copperSovereign',
    name: 'Copper Sovereign Lustre',
    category: 'GOLDS',
    mode: 'DARK',
    description: 'Polished fiery copper with glowing warm amber highlights',
    primary: '#C2410C',
    primaryHover: '#9A3412',
    previewColor: '#C2410C',
    goldRgb: {
      50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '251 146 60',
      400: '249 115 22', 500: '234 88 12', 600: '194 65 12', 700: '154 52 18',
      800: '124 45 18', 900: '99 35 15', 950: '45 15 5'
    },
  },
  {
    id: 'champagneShimmer',
    name: 'Champagne Flute Shimmer',
    category: 'GOLDS',
    mode: 'LIGHT',
    description: 'Effervescent vintage champagne with ivory crystal glow',
    primary: '#D97706',
    primaryHover: '#B45309',
    previewColor: '#D97706',
    goldRgb: {
      50: '254 243 199', 100: '253 230 138', 200: '252 211 77', 300: '245 158 11',
      400: '217 119 6', 500: '180 83 9', 600: '146 64 14', 700: '120 53 15',
      800: '90 40 10', 900: '65 28 8', 950: '35 15 4'
    },
  },
  {
    id: 'titaniumNoir',
    name: 'Titanium Gilded Chrome',
    category: 'GOLDS',
    mode: 'DARK',
    description: 'Space-age titanium gunmetal with golden laser accents',
    primary: '#A3A3A3',
    primaryHover: '#737373',
    previewColor: '#A3A3A3',
    goldRgb: {
      50: '250 250 250', 100: '245 245 245', 200: '229 229 229', 300: '212 212 212',
      400: '163 163 163', 500: '115 115 115', 600: '82 82 82', 700: '64 64 64',
      800: '38 38 38', 900: '23 23 23', 950: '10 10 10'
    },
  },

  // =========================================================================
  // 2. JEWELS & ROYAL (9)
  // =========================================================================
  {
    id: 'sapphirePrestige',
    name: 'Sapphire Prestige & Navy',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Prestigious royal blue with deep midnight navy',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    previewColor: '#2563EB',
    goldRgb: {
      50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253',
      400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216',
      800: '30 64 175', 900: '30 58 138', 950: '15 23 42'
    },
  },
  {
    id: 'rubyPrestige',
    name: 'Ruby Sovereign & Crimson',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Deep royal ruby jewel tones with wine velvet',
    primary: '#DC2626',
    primaryHover: '#B91C1C',
    previewColor: '#DC2626',
    goldRgb: {
      50: '254 242 242', 100: '254 226 226', 200: '254 202 202', 300: '252 165 165',
      400: '248 113 113', 500: '239 68 68', 600: '220 38 38', 700: '185 28 28',
      800: '153 27 27', 900: '127 29 29', 950: '69 10 10'
    },
  },
  {
    id: 'amethystRoyal',
    name: 'Amethyst Sovereign Violet',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Majestic imperial violet with lavender crystal',
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    previewColor: '#7C3AED',
    goldRgb: {
      50: '245 243 255', 100: '237 233 254', 200: '221 214 254', 300: '196 181 253',
      400: '167 139 250', 500: '139 92 246', 600: '124 58 237', 700: '109 40 217',
      800: '91 33 182', 900: '76 29 149', 950: '46 16 101'
    },
  },
  {
    id: 'emeraldLuxury',
    name: 'Emerald Opulence & Ivory',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Regal botanical emerald with warm champagne',
    primary: '#059669',
    primaryHover: '#047857',
    previewColor: '#059669',
    goldRgb: {
      50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172',
      400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
      800: '6 95 70', 900: '6 78 59', 950: '2 44 34'
    },
  },
  {
    id: 'turquoisePalace',
    name: 'Turquoise Palace Lagoon',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Ottoman palace turquoise and Caribbean lagoon crystal',
    primary: '#0891B2',
    primaryHover: '#0E7490',
    previewColor: '#0891B2',
    goldRgb: {
      50: '236 254 255', 100: '207 250 254', 200: '165 243 252', 300: '103 232 249',
      400: '34 211 238', 500: '6 182 212', 600: '8 145 178', 700: '14 116 144',
      800: '21 94 117', 900: '22 78 99', 950: '8 40 50'
    },
  },
  {
    id: 'tanzaniteMystique',
    name: 'Tanzanite Royal Mystique',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Deep Kilimanjaro indigo-violet with velvet night',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    previewColor: '#6366F1',
    goldRgb: {
      50: '238 242 255', 100: '224 231 255', 200: '199 210 254', 300: '165 180 252',
      400: '129 140 248', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202',
      800: '55 48 163', 900: '49 46 129', 950: '30 27 75'
    },
  },
  {
    id: 'imperialTopaz',
    name: 'Imperial Golden Topaz',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Sunlit Brazilian imperial topaz with golden cognac warmth',
    primary: '#EA580C',
    primaryHover: '#C2410C',
    previewColor: '#EA580C',
    goldRgb: {
      50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116',
      400: '251 146 60', 500: '249 115 22', 600: '234 88 12', 700: '194 65 12',
      800: '154 52 18', 900: '124 45 18', 950: '55 18 8'
    },
  },
  {
    id: 'garnetVelvet',
    name: 'Garnet Velvet Sovereign',
    category: 'JEWELS',
    mode: 'DARK',
    description: 'Deep wine garnet with Bohemian crystal lustre',
    primary: '#BE123C',
    primaryHover: '#9F1239',
    previewColor: '#BE123C',
    goldRgb: {
      50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175',
      400: '251 113 133', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60',
      800: '159 18 57', 900: '136 19 55', 950: '70 8 26'
    },
  },
  {
    id: 'aquamarineGlow',
    name: 'Aquamarine Sovereign Glow',
    category: 'JEWELS',
    mode: 'LIGHT',
    description: 'Pure glacial aquamarine with diamond water clarity',
    primary: '#06B6D4',
    primaryHover: '#0891B2',
    previewColor: '#06B6D4',
    goldRgb: {
      50: '236 254 255', 100: '207 250 254', 200: '165 243 252', 300: '103 232 249',
      400: '34 211 238', 500: '6 182 212', 600: '8 145 178', 700: '14 116 144',
      800: '21 94 117', 900: '22 78 99', 950: '10 45 55'
    },
  },

  // =========================================================================
  // 3. FLORALS & ROMANCE (9)
  // =========================================================================
  {
    id: 'midnightRose',
    name: 'Midnight Rose & Velvet',
    category: 'FLORALS',
    mode: 'DARK',
    description: 'Romantic couture crimson with warm blush ivory',
    primary: '#E11D48',
    primaryHover: '#BE123C',
    previewColor: '#E11D48',
    goldRgb: {
      50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175',
      400: '251 113 133', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60',
      800: '159 18 57', 900: '136 19 55', 950: '76 5 25'
    },
  },
  {
    id: 'lavenderBliss',
    name: 'French Lavender Mist',
    category: 'FLORALS',
    mode: 'LIGHT',
    description: 'Graceful Provence lavender with cashmere white',
    primary: '#9333EA',
    primaryHover: '#7E22CE',
    previewColor: '#9333EA',
    goldRgb: {
      50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254',
      400: '192 132 252', 500: '168 85 247', 600: '147 51 234', 700: '126 34 206',
      800: '107 33 168', 900: '88 28 135', 950: '59 7 100'
    },
  },
  {
    id: 'cherryBlossom',
    name: 'Kyoto Cherry Blossom',
    category: 'FLORALS',
    mode: 'LIGHT',
    description: 'Delicate sakura petals with glowing pastel pink',
    primary: '#F472B6',
    primaryHover: '#DB2777',
    previewColor: '#F472B6',
    goldRgb: {
      50: '253 242 248', 100: '252 231 243', 200: '24BC 213 232', 300: '244 114 182',
      400: '236 72 153', 500: '219 39 119', 600: '190 24 93', 700: '157 23 77',
      800: '131 24 67', 900: '112 26 63', 950: '60 10 32'
    },
  },
  {
    id: 'velvetPeony',
    name: 'Velvet Peony Glamour',
    category: 'FLORALS',
    mode: 'DARK',
    description: 'Lush coral peony bouquet with golden candlelight',
    primary: '#E11D48',
    primaryHover: '#BE123C',
    previewColor: '#E11D48',
    goldRgb: {
      50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175',
      400: '251 113 133', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60',
      800: '159 18 57', 900: '136 19 55', 950: '65 5 20'
    },
  },
  {
    id: 'coralSunset',
    name: 'Capri Coral Sunset',
    category: 'FLORALS',
    mode: 'LIGHT',
    description: 'Vibrant Mediterranean sunset coral with champagne gold',
    primary: '#F97316',
    primaryHover: '#EA580C',
    previewColor: '#F97316',
    goldRgb: {
      50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116',
      400: '251 146 60', 500: '249 115 22', 600: '234 88 12', 700: '194 65 12',
      800: '154 52 18', 900: '124 45 18', 950: '60 18 6'
    },
  },
  {
    id: 'crimsonRomance',
    name: 'Bordeaux Crimson Romance',
    category: 'FLORALS',
    mode: 'DARK',
    description: 'Deep French Bordeaux wine with romantic midnight roses',
    primary: '#9F1239',
    primaryHover: '#881337',
    previewColor: '#9F1239',
    goldRgb: {
      50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175',
      400: '251 113 133', 500: '225 29 72', 600: '190 18 60', 700: '159 18 57',
      800: '136 19 55', 900: '100 12 40', 950: '50 5 20'
    },
  },
  {
    id: 'orchidMajesty',
    name: 'Imperial Orchid Majesty',
    category: 'FLORALS',
    mode: 'DARK',
    description: 'Exotic wild orchid magenta with luminous velvet sheen',
    primary: '#C026D3',
    primaryHover: '#A21CAF',
    previewColor: '#C026D3',
    goldRgb: {
      50: '253 244 255', 100: '250 232 255', 200: '245 208 254', 300: '240 171 252',
      400: '232 121 249', 500: '217 70 239', 600: '192 38 211', 700: '162 28 175',
      800: '134 25 143', 900: '112 26 117', 950: '60 10 65'
    },
  },
  {
    id: 'dahliaNoir',
    name: 'Black Dahlia Nocturne',
    category: 'FLORALS',
    mode: 'DARK',
    description: 'Dramatic gothic midnight dahlia with electric violet sparkles',
    primary: '#86198F',
    primaryHover: '#701A75',
    previewColor: '#86198F',
    goldRgb: {
      50: '253 244 255', 100: '250 232 255', 200: '245 208 254', 300: '232 121 249',
      400: '192 38 211', 500: '162 28 175', 600: '134 25 143', 700: '112 26 117',
      800: '90 20 95', 900: '70 15 75', 950: '40 8 45'
    },
  },
  {
    id: 'lilacDream',
    name: 'English Lilac Dream',
    category: 'FLORALS',
    mode: 'LIGHT',
    description: 'Soft English garden lilac with morning dew reflections',
    primary: '#A855F7',
    primaryHover: '#9333EA',
    previewColor: '#A855F7',
    goldRgb: {
      50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254',
      400: '192 132 252', 500: '168 85 247', 600: '147 51 234', 700: '126 34 206',
      800: '107 33 168', 900: '88 28 135', 950: '45 10 70'
    },
  },

  // =========================================================================
  // 4. BOTANICALS & EARTH (9)
  // =========================================================================
  {
    id: 'sageBotanical',
    name: 'Sage Botanical & Linen',
    category: 'BOTANICALS',
    mode: 'LIGHT',
    description: 'Fresh Mediterranean sage with natural luxury linen',
    primary: '#16A34A',
    primaryHover: '#15803D',
    previewColor: '#16A34A',
    goldRgb: {
      50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172',
      400: '74 222 128', 500: '34 197 94', 600: '22 163 74', 700: '21 128 61',
      800: '22 101 52', 900: '20 83 45', 950: '5 46 22'
    },
  },
  {
    id: 'forestVelvet',
    name: 'Black Forest Velvet',
    category: 'BOTANICALS',
    mode: 'DARK',
    description: 'Enchanted deep evergreen forest with golden fireflies',
    primary: '#15803D',
    primaryHover: '#166534',
    previewColor: '#15803D',
    goldRgb: {
      50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172',
      400: '34 197 94', 500: '22 163 74', 600: '21 128 61', 700: '22 101 52',
      800: '20 83 45', 900: '15 65 35', 950: '4 35 18'
    },
  },
  {
    id: 'mintWhisper',
    name: 'Moroccan Mint Whisper',
    category: 'BOTANICALS',
    mode: 'LIGHT',
    description: 'Refreshing iced Moroccan mint with frosted crystal highlights',
    primary: '#10B981',
    primaryHover: '#059669',
    previewColor: '#10B981',
    goldRgb: {
      50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183',
      400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
      800: '6 95 70', 900: '6 78 59', 950: '2 40 30'
    },
  },
  {
    id: 'oliveImperial',
    name: 'Tuscan Olive Imperial',
    category: 'BOTANICALS',
    mode: 'DARK',
    description: 'Tuscan olive grove with warm earthen terracotta accents',
    primary: '#65A30D',
    primaryHover: '#4D7C0F',
    previewColor: '#65A30D',
    goldRgb: {
      50: '247 254 231', 100: '236 252 203', 200: '217 249 157', 300: '190 242 100',
      400: '163 230 53', 500: '132 204 22', 600: '101 163 13', 700: '77 124 15',
      800: '63 98 18', 900: '54 83 20', 950: '26 46 8'
    },
  },
  {
    id: 'jadeSovereign',
    name: 'Imperial Jade Dynasty',
    category: 'BOTANICALS',
    mode: 'DARK',
    description: 'Deep Burmese jade with polished imperial gold embellishments',
    primary: '#0D9488',
    primaryHover: '#0F766E',
    previewColor: '#0D9488',
    goldRgb: {
      50: '240 253 250', 100: '204 251 241', 200: '153 246 228', 300: '94 234 212',
      400: '45 212 191', 500: '20 184 166', 600: '13 148 136', 700: '15 118 110',
      800: '17 94 89', 900: '19 78 74', 950: '4 47 46'
    },
  },
  {
    id: 'mossGold',
    name: 'Nordic Moss & Gold',
    category: 'BOTANICALS',
    mode: 'DARK',
    description: 'Lush Nordic moss with damp earth and gilded foliage',
    primary: '#84CC16',
    primaryHover: '#65A30D',
    previewColor: '#84CC16',
    goldRgb: {
      50: '247 254 231', 100: '236 252 203', 200: '217 249 157', 300: '190 242 100',
      400: '163 230 53', 500: '132 204 22', 600: '101 163 13', 700: '77 124 15',
      800: '63 98 18', 900: '54 83 20', 950: '20 40 8'
    },
  },
  {
    id: 'eucalyptusMist',
    name: 'Silver Eucalyptus Mist',
    category: 'BOTANICALS',
    mode: 'LIGHT',
    description: 'Cool silver-green eucalyptus foliage with soft white fog',
    primary: '#14B8A6',
    primaryHover: '#0D9488',
    previewColor: '#14B8A6',
    goldRgb: {
      50: '240 253 250', 100: '204 251 241', 200: '153 246 228', 300: '94 234 212',
      400: '45 212 191', 500: '20 184 166', 600: '13 148 136', 700: '15 118 110',
      800: '17 94 89', 900: '19 78 74', 950: '10 40 38'
    },
  },
  {
    id: 'pistachioLuxe',
    name: 'Persian Pistachio Velvet',
    category: 'BOTANICALS',
    mode: 'LIGHT',
    description: 'Creamy pistachio silk with golden saffron undertones',
    primary: '#84CC16',
    primaryHover: '#65A30D',
    previewColor: '#84CC16',
    goldRgb: {
      50: '247 254 231', 100: '236 252 203', 200: '217 249 157', 300: '190 242 100',
      400: '163 230 53', 500: '132 204 22', 600: '101 163 13', 700: '77 124 15',
      800: '63 98 18', 900: '54 83 20', 950: '25 45 10'
    },
  },
  {
    id: 'pineMajesty',
    name: 'Alpine Pine Majesty',
    category: 'BOTANICALS',
    mode: 'DARK',
    description: 'Regal Alpine mountain pine with crisp frosty pinecones',
    primary: '#047857',
    primaryHover: '#065F46',
    previewColor: '#047857',
    goldRgb: {
      50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183',
      400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
      800: '6 95 70', 900: '6 78 59', 950: '2 35 25'
    },
  },

  // =========================================================================
  // 5. MODERN DARK & NOIR (9)
  // =========================================================================
  {
    id: 'midnightOnyx',
    name: 'Midnight Onyx & Electric Gold',
    category: 'DARKS',
    mode: 'DARK',
    description: 'High-contrast pure onyx with radiant high-voltage gold',
    primary: '#EAB308',
    primaryHover: '#CA8A04',
    previewColor: '#EAB308',
    goldRgb: {
      50: '254 252 232', 100: '254 249 195', 200: '254 240 138', 300: '253 224 71',
      400: '250 204 21', 500: '234 179 8', 600: '202 138 4', 700: '161 98 7',
      800: '133 77 14', 900: '113 63 18', 950: '10 10 10'
    },
  },
  {
    id: 'obsidianNoir',
    name: 'Obsidian Noir & Chrome',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Minimalist haute monochrome with polished platinum chrome',
    primary: '#71717A',
    primaryHover: '#52525B',
    previewColor: '#71717A',
    goldRgb: {
      50: '250 250 250', 100: '244 244 245', 200: '228 228 231', 300: '212 212 216',
      400: '161 161 170', 500: '113 113 122', 600: '82 82 91', 700: '63 63 70',
      800: '39 39 42', 900: '24 24 27', 950: '9 9 11'
    },
  },
  {
    id: 'galacticPurple',
    name: 'Galactic Nebula Violet',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Deep cosmic space purple with glowing stardust nebulas',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    previewColor: '#8B5CF6',
    goldRgb: {
      50: '245 243 255', 100: '237 233 254', 200: '221 214 254', 300: '196 181 253',
      400: '167 139 250', 500: '139 92 246', 600: '124 58 237', 700: '109 40 217',
      800: '91 33 182', 900: '76 29 149', 950: '30 8 60'
    },
  },
  {
    id: 'cyberTeal',
    name: 'Cyber Neo-Teal Glow',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Futuristic electric teal with deep pitch-black contrast',
    primary: '#14B8A6',
    primaryHover: '#0D9488',
    previewColor: '#14B8A6',
    goldRgb: {
      50: '240 253 250', 100: '204 251 241', 200: '153 246 228', 300: '94 234 212',
      400: '45 212 191', 500: '20 184 166', 600: '13 148 136', 700: '15 118 110',
      800: '17 94 89', 900: '19 78 74', 950: '6 35 34'
    },
  },
  {
    id: 'vampireRed',
    name: 'Vampire Blood Sovereign',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Gothic crimson blood velvet with dramatic pitch noir',
    primary: '#B91C1C',
    primaryHover: '#991B1B',
    previewColor: '#B91C1C',
    goldRgb: {
      50: '254 242 242', 100: '254 226 226', 200: '254 202 202', 300: '252 165 165',
      400: '248 113 113', 500: '239 68 68', 600: '220 38 38', 700: '185 28 28',
      800: '153 27 27', 900: '127 29 29', 950: '45 5 5'
    },
  },
  {
    id: 'midnightOcean',
    name: 'Midnight Abyssal Ocean',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Deep oceanic trench blue with bioluminescent accents',
    primary: '#0284C7',
    primaryHover: '#0369A1',
    previewColor: '#0284C7',
    goldRgb: {
      50: '240 249 255', 100: '224 242 254', 200: '186 230 253', 300: '125 211 252',
      400: '56 189 248', 500: '14 165 233', 600: '2 132 199', 700: '3 105 161',
      800: '7 89 133', 900: '12 74 110', 950: '5 25 45'
    },
  },
  {
    id: 'cosmicIndigo',
    name: 'Cosmic Indigo Eclipse',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Mystic eclipse indigo with lunar silver starbursts',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    previewColor: '#4F46E5',
    goldRgb: {
      50: '238 242 255', 100: '224 231 255', 200: '199 210 254', 300: '165 180 252',
      400: '129 140 248', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202',
      800: '55 48 163', 900: '49 46 129', 950: '20 18 50'
    },
  },
  {
    id: 'carbonGold',
    name: 'Carbon Fiber & 24K Gold',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Matte woven carbon weave with sleek polished gold lines',
    primary: '#CA8A04',
    primaryHover: '#A16207',
    previewColor: '#CA8A04',
    goldRgb: {
      50: '254 252 232', 100: '254 249 195', 200: '254 240 138', 300: '253 224 71',
      400: '250 204 21', 500: '234 179 8', 600: '202 138 4', 700: '161 98 7',
      800: '133 77 14', 900: '113 63 18', 950: '12 12 12'
    },
  },
  {
    id: 'shadowBronze',
    name: 'Shadow Bronze Nocturne',
    category: 'DARKS',
    mode: 'DARK',
    description: 'Smoky metallic bronze with deep shadow patina',
    primary: '#A16207',
    primaryHover: '#854D0E',
    previewColor: '#A16207',
    goldRgb: {
      50: '254 252 232', 100: '254 240 138', 200: '250 204 21', 300: '202 138 4',
      400: '161 98 7', 500: '133 77 14', 600: '113 63 18', 700: '90 48 12',
      800: '65 35 10', 900: '45 22 6', 950: '18 8 2'
    },
  },

  // =========================================================================
  // 6. LIGHT & SOFT IVORY (7)
  // =========================================================================
  {
    id: 'pearlChampagne',
    name: 'Pearl Ivory & Warm Champagne',
    category: 'LIGHTS',
    mode: 'LIGHT',
    description: 'Ethereal luminous pearl ivory with shimmering champagne',
    primary: '#C5A880',
    primaryHover: '#A88860',
    previewColor: '#C5A880',
    goldRgb: {
      50: '253 251 247', 100: '250 245 238', 200: '244 235 220', 300: '235 220 198',
      400: '218 195 165', 500: '197 168 128', 600: '168 136 96', 700: '137 108 72',
      800: '106 82 53', 900: '78 58 36', 950: '44 34 24'
    },
  },
  {
    id: 'frenchLinen',
    name: 'French Haute Linen',
    category: 'LIGHTS',
    mode: 'LIGHT',
    description: 'Natural unbleached French linen with soft oat milk warmth',
    primary: '#A88860',
    primaryHover: '#896C48',
    previewColor: '#A88860',
    goldRgb: {
      50: '251 248 243', 100: '245 239 235', 200: '235 221 207', 300: '223 200 178',
      400: '210 178 148', 500: '197 168 128', 600: '168 136 96', 700: '137 108 72',
      800: '106 82 53', 900: '78 58 36', 950: '40 30 20'
    },
  },
  {
    id: 'cashmereCream',
    name: 'Cashmere Cream & Gold',
    category: 'LIGHTS',
    mode: 'LIGHT',
    description: 'Ultra-soft Italian cashmere cream with gentle warm gold',
    primary: '#D4AF37',
    primaryHover: '#B89726',
    previewColor: '#D4AF37',
    goldRgb: {
      50: '254 252 245', 100: '250 245 230', 200: '242 232 205', 300: '230 215 170',
      400: '218 195 130', 500: '200 170 90', 600: '175 145 65', 700: '145 115 45',
      800: '115 85 30', 900: '85 60 20', 950: '40 28 8'
    },
  },
  {
    id: 'diamondFrost',
    name: 'Diamond Frost & Ice Platinum',
    category: 'LIGHTS',
    mode: 'LIGHT',
    description: 'Ultra-crisp crystal diamond ice with soft sky platinum',
    primary: '#0284C7',
    primaryHover: '#0369A1',
    previewColor: '#0284C7',
    goldRgb: {
      50: '240 249 255', 100: '224 242 254', 200: '186 230 253', 300: '125 211 252',
      400: '56 189 248', 500: '14 165 233', 600: '2 132 199', 700: '3 105 161',
      800: '7 89 133', 900: '12 74 110', 950: '8 47 73'
    },
  },
  {
    id: 'vanillaSilk',
    name: 'Vanilla Silk & Sandalwood',
    category: 'LIGHTS',
    mode: 'LIGHT',
    description: 'Velvety Madagascar vanilla silk with sandalwood fragrance',
    primary: '#D97706',
    primaryHover: '#B45309',
    previewColor: '#D97706',
    goldRgb: {
      50: '255 251 235', 100: '254 243 199', 200: '253 230 138', 300: '252 211 77',
      400: '251 191 36', 500: '245 158 11', 600: '217 119 6', 700: '180 83 9',
      800: '146 64 14', 900: '120 53 15', 950: '45 20 5'
    },
  },
  {
    id: 'alabasterGlow',
    name: 'Alabaster Roman Marble',
    category: 'LIGHTS',
    mode: 'LIGHT',
    description: 'Translucent Italian alabaster marble with gold veining',
    primary: '#CA8A04',
    primaryHover: '#A16207',
    previewColor: '#CA8A04',
    goldRgb: {
      50: '254 252 232', 100: '254 249 195', 200: '254 240 138', 300: '253 224 71',
      400: '250 204 21', 500: '234 179 8', 600: '202 138 4', 700: '161 98 7',
      800: '133 77 14', 900: '113 63 18', 950: '35 20 4'
    },
  },
  {
    id: 'porcelainBlue',
    name: 'Ming Porcelain Blue & Ivory',
    category: 'LIGHTS',
    mode: 'LIGHT',
    description: 'Classic Ming dynasty cobalt blue with crisp white porcelain',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    previewColor: '#3B82F6',
    goldRgb: {
      50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253',
      400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216',
      800: '30 64 175', 900: '30 58 138', 950: '15 25 50'
    },
  },
];

/**
 * Format raw theme object into full UI token schema
 */
export function formatTheme(raw) {
  const g = raw.goldRgb || {};
  const c = raw.champagneRgb || raw.goldRgb || {};

  const primary = raw.primary || '#D4AF37';
  const primaryHover = raw.primaryHover || '#B38728';

  return {
    ...raw,
    cssClass: `theme-${raw.id}`,
    primaryLight: raw.primaryLight || '#FAF5E8',
    primaryDark: raw.primaryDark || '#141210',
    accentColor: raw.accentColor || primaryHover,
    borderColor: raw.borderColor || '#E5DCCB',
    goldScale: {
      50: g[50] || '253 249 238',
      100: g[100] || '251 240 211',
      200: g[200] || '245 222 159',
      300: g[300] || '236 200 103',
      400: g[400] || '226 177 52',
      500: g[500] || '212 175 55',
      600: g[600] || '184 151 38',
      700: g[700] || '148 117 28',
      800: g[800] || '117 90 27',
      900: g[900] || '95 71 25',
      950: g[950] || '50 37 13',
    },
    champagneScale: {
      50: c[50] || g[50] || '251 248 243',
      100: c[100] || g[100] || '245 239 235',
      200: c[200] || g[200] || '235 221 207',
      300: c[300] || g[300] || '223 200 178',
      400: c[400] || g[400] || '210 178 148',
      500: c[500] || g[500] || '197 168 128',
      600: c[600] || g[600] || '168 136 96',
      700: c[700] || g[700] || '137 108 72',
      800: c[800] || g[800] || '106 82 53',
      900: c[900] || g[900] || '78 58 36',
    },
    ambientRadial: `radial-gradient(ellipse at center, rgba(${g[500] || '212,175,55'}, 0.25) 0%, rgba(${g[800] || '117,90,27'}, 0.12) 45%, rgba(8,7,6,0.98) 75%)`,
    glowAura: `rgba(${g[500] || '212,175,55'}, 0.42)`,
    glowDrop: `rgba(${g[500] || '212,175,55'}, 0.5)`,
    strokeColor: `rgb(${g[200] || '245,222,159'})`,
    progressShadow: `0 0 12px rgba(${g[500] || '212,175,55'}, 0.45)`,
  };
}

export const THEMES_MAP = RAW_THEMES.reduce((acc, raw) => {
  acc[raw.id] = formatTheme(raw);
  return acc;
}, {});

export const ALL_THEMES_LIST = Object.values(THEMES_MAP);

/**
 * Injects CSS variables for any active theme immediately into the DOM
 */
export function applyThemeVariablesToDOM(themeKey) {
  if (typeof window === 'undefined') return;
  const theme = THEMES_MAP[themeKey] || THEMES_MAP.royalGold;

  const root = document.documentElement;

  // Set gold and champagne scales
  Object.entries(theme.goldScale).forEach(([key, val]) => {
    root.style.setProperty(`--color-gold-${key}`, val);
  });
  Object.entries(theme.champagneScale).forEach(([key, val]) => {
    root.style.setProperty(`--color-champagne-${key}`, val);
  });

  // Set visual ambient variables
  root.style.setProperty('--theme-ambient-radial', theme.ambientRadial);
  root.style.setProperty('--theme-glow-aura', theme.glowAura);
  root.style.setProperty('--theme-glow-drop', theme.glowDrop);
  root.style.setProperty('--theme-stroke-color', theme.strokeColor);
  root.style.setProperty('--theme-progress-shadow', theme.progressShadow);

  root.style.setProperty('--color-theme-primary', theme.primary);
  root.style.setProperty('--color-theme-primary-hover', theme.primaryHover);
  root.style.setProperty('--color-theme-accent', theme.accentColor);

  // Update theme class on HTML and body
  ALL_THEMES_LIST.forEach((t) => {
    document.documentElement.classList.remove(t.cssClass);
    document.body.classList.remove(t.cssClass);
  });
  document.documentElement.classList.add(theme.cssClass);
  document.body.classList.add(theme.cssClass);

  // Store in cache
  try {
    localStorage.setItem('lumiere_color_theme', theme.id);
    localStorage.setItem('lumiere_theme_data', JSON.stringify(theme));
  } catch (e) {}
}
