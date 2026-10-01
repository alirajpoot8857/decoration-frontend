import './globals.css';
import { Playfair_Display, Plus_Jakarta_Sans, Cormorant_Garamond, Outfit } from 'next/font/google';
import { ToastProvider } from '../src/context/ToastContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { DiscountProvider } from '../src/context/DiscountContext';
import { RentalCartProvider } from '../src/context/RentalCartContext';
import { ConfirmModalProvider } from '../src/context/ConfirmModalContext';
import AppWrapper from '../src/components/layout/AppWrapper';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'LUMIÈRE DECOR — Haute Scénographie & Luxury Event Decoration',
  description:
    'Bespoke luxury stage design, haute botanical floral installations, and dramatic wedding scenography. We turn moments into masterpieces.',
  keywords: [
    'luxury event decoration',
    'wedding decor',
    'luxury floral stages',
    'beverly hills wedding stylist',
    'event rental luxury',
    'lumiere decor',
  ],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} ${cormorant.variable} ${outfit.variable} scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('lumiere_theme_mode') || 'dark';
                  if (mode === 'light') {
                    document.documentElement.classList.remove('dark', 'theme-mode-dark');
                    document.documentElement.classList.add('light', 'theme-mode-light');
                  } else {
                    document.documentElement.classList.remove('light', 'theme-mode-light');
                    document.documentElement.classList.add('dark', 'theme-mode-dark');
                  }

                  var theme = localStorage.getItem('lumiere_color_theme') || 'royalGold';
                  document.documentElement.classList.add('theme-' + theme);
                  var dataStr = localStorage.getItem('lumiere_theme_data');
                  if (dataStr) {
                    var d = JSON.parse(dataStr);
                    var root = document.documentElement;
                    if (d.goldScale) {
                      for (var k in d.goldScale) {
                        root.style.setProperty('--color-gold-' + k, d.goldScale[k]);
                      }
                    }
                    if (d.champagneScale) {
                      for (var c in d.champagneScale) {
                        root.style.setProperty('--color-champagne-' + c, d.champagneScale[c]);
                      }
                    }
                    if (d.ambientRadial) root.style.setProperty('--theme-ambient-radial', d.ambientRadial);
                    if (d.glowAura) root.style.setProperty('--theme-glow-aura', d.glowAura);
                    if (d.primary) root.style.setProperty('--color-theme-primary', d.primary);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#070709] text-ivory-50 min-h-screen flex flex-col antialiased selection:bg-gold-500 selection:text-obsidian-950">
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              <DiscountProvider>
                <RentalCartProvider>
                  <ConfirmModalProvider>
                    <AppWrapper>{children}</AppWrapper>
                  </ConfirmModalProvider>
                </RentalCartProvider>
              </DiscountProvider>
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
