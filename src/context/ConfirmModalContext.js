'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

const ConfirmModalContext = createContext(null);

export function ConfirmModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    itemName: null,
    confirmText: 'Delete Permanently',
    cancelText: 'Cancel',
    isDestructive: true,
    onConfirm: null,
    isLoading: false,
  });

  const confirmDelete = useCallback(({
    title = 'Confirm Deletion',
    message = 'Are you sure you want to permanently delete this item? This action cannot be undone.',
    itemName = null,
    confirmText = 'Delete Permanently',
    cancelText = 'Cancel',
    isDestructive = true,
    onConfirm,
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        itemName,
        confirmText,
        cancelText,
        isDestructive,
        isLoading: false,
        onConfirm: async () => {
          if (onConfirm) {
            setModalState((prev) => ({ ...prev, isLoading: true }));
            try {
              await onConfirm();
              resolve(true);
            } catch (err) {
              console.error('Confirm action failed:', err);
              resolve(false);
            } finally {
              setModalState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
            }
          } else {
            resolve(true);
            setModalState((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    });
  }, []);

  const closeModal = useCallback(() => {
    if (modalState.isLoading) return; // Prevent closing while API request in flight
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [modalState.isLoading]);

  return (
    <ConfirmModalContext.Provider value={{ confirmDelete, closeModal }}>
      {children}

      {/* Luxury Confirmation Modal Backdrop */}
      {modalState.isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn"
          onClick={closeModal}
        >
          {/* Modal Dialog Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#0d0b08] border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.15)] text-center space-y-5 animate-scaleUp"
          >
            {/* Top Close Button */}
            {!modalState.isLoading && (
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 p-1.5 rounded-full text-obsidian-400 hover:text-ivory-50 hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Glowing Icon Badge */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.25)]">
              {modalState.isDestructive ? (
                <Trash2 className="w-8 h-8 text-red-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-gold-400" />
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-ivory-50 font-light tracking-wide">
                {modalState.title}
              </h3>
              <p className="text-xs sm:text-sm text-ivory-200/80 leading-relaxed font-light">
                {modalState.message}
              </p>
              {modalState.itemName && (
                <div className="inline-block mt-2 px-3 py-1 bg-white/[0.04] border border-gold-500/25 rounded-xl font-mono text-xs text-gold-400">
                  {modalState.itemName}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                disabled={modalState.isLoading}
                onClick={closeModal}
                className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-ivory-200 text-xs font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
              >
                {modalState.cancelText}
              </button>

              <button
                type="button"
                disabled={modalState.isLoading}
                onClick={modalState.onConfirm}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {modalState.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 text-white/90" />
                    <span>{modalState.confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmModalContext.Provider>
  );
}

export function useConfirmModal() {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error('useConfirmModal must be used within a ConfirmModalProvider');
  }
  return context;
}
