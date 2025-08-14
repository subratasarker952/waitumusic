import { useState, useEffect, useReducer } from 'react';

// Global modal state management for cross-component synchronization

interface ModalStore {
  activeModals: Set<string>;
  modalData: Record<string, any>;
  modalHistory: string[];
}

let store: ModalStore = {
  activeModals: new Set(),
  modalData: {},
  modalHistory: []
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useGlobalModalState() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  
  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, []);

  return {
    activeModals: store.activeModals,
    modalData: store.modalData,
    modalHistory: store.modalHistory,
    
    openModal: (modalId: string, data?: any) => {
      store.activeModals.add(modalId);
      if (data) {
        store.modalData[modalId] = data;
      }
      store.modalHistory.push(modalId);
      notifyListeners();
    },
    
    closeModal: (modalId: string) => {
      store.activeModals.delete(modalId);
      delete store.modalData[modalId];
      store.modalHistory = store.modalHistory.filter(id => id !== modalId);
      notifyListeners();
    },
    
    closeAllModals: () => {
      store.activeModals.clear();
      store.modalData = {};
      store.modalHistory = [];
      notifyListeners();
    },
    
    isModalOpen: (modalId: string) => {
      return store.activeModals.has(modalId);
    },
    
    getModalData: (modalId: string) => {
      return store.modalData[modalId];
    },
    
    updateModalData: (modalId: string, data: any) => {
      store.modalData[modalId] = { ...store.modalData[modalId], ...data };
      notifyListeners();
    },
    
    getTopModal: () => {
      return store.modalHistory.length > 0 ? store.modalHistory[store.modalHistory.length - 1] : null;
    },
    
    popModal: () => {
      const topModal = store.modalHistory[store.modalHistory.length - 1];
      if (topModal) {
        store.activeModals.delete(topModal);
        delete store.modalData[topModal];
        store.modalHistory.pop();
        notifyListeners();
      }
    }
  };
}

// Keyboard shortcut handler for modals
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Modal escape handling can be added here
    }
  });
}