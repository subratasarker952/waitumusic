import { useState, useCallback } from 'react';

// Centralized modal state management hook
export function useModalManager() {
  const [activeModals, setActiveModals] = useState<Set<string>>(new Set());
  const [modalData, setModalData] = useState<Record<string, any>>({});

  const openModal = useCallback((modalId: string, data?: any) => {
    setActiveModals(prev => new Set(prev).add(modalId));
    if (data) {
      setModalData(prev => ({ ...prev, [modalId]: data }));
    }
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setActiveModals(prev => {
      const next = new Set(prev);
      next.delete(modalId);
      return next;
    });
    setModalData(prev => {
      const next = { ...prev };
      delete next[modalId];
      return next;
    });
  }, []);

  const isModalOpen = useCallback((modalId: string) => {
    return activeModals.has(modalId);
  }, [activeModals]);

  const getModalData = useCallback((modalId: string) => {
    return modalData[modalId];
  }, [modalData]);

  const closeAllModals = useCallback(() => {
    setActiveModals(new Set());
    setModalData({});
  }, []);

  return {
    openModal,
    closeModal,
    isModalOpen,
    getModalData,
    closeAllModals,
    activeModals: Array.from(activeModals)
  };
}

// Global modal manager instance for cross-component communication
export const globalModalManager = {
  listeners: new Set<(modalId: string, action: 'open' | 'close', data?: any) => void>(),
  
  subscribe(listener: (modalId: string, action: 'open' | 'close', data?: any) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  emit(modalId: string, action: 'open' | 'close', data?: any) {
    this.listeners.forEach(listener => listener(modalId, action, data));
  }
};