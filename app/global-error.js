'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="bg-[#070709] text-white flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif">A System Error Occurred</h1>
          <p className="text-xs text-gray-400">
            A critical error occurred in the application.
          </p>
          <button
            onClick={() => reset ? reset() : window.location.reload()}
            className="px-6 py-3 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-full hover:brightness-110 transition-all flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </body>
    </html>
  );
}
