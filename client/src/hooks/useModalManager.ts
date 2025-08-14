import { useState, useCallback, useRef } from 'react';

interface ModalState {
  id: string;
  isOpen: boolean;
  zIndex: number;
}

// Global modal state manager to prevent conflicts
class ModalManager {
  private modals: Map<string, ModalState> = new Map();
  private listeners: Set<() => void> = new Set();
  private baseZIndex = 1000;

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  openModal(id: string): number {
    const openModals = Array.from(this.modals.values()).filter(m => m.isOpen);
    const zIndex = this.baseZIndex + openModals.length * 10;
    
    this.modals.set(id, { id, isOpen: true, zIndex });
    this.notify();
    return zIndex;
  }

  closeModal(id: string) {
    const modal = this.modals.get(id);
    if (modal) {
      this.modals.set(id, { ...modal, isOpen: false });
      this.notify();
    }
  }

  closeAllModals() {
    this.modals.forEach((modal, id) => {
      this.modals.set(id, { ...modal, isOpen: false });
    });
    this.notify();
  }

  isModalOpen(id: string): boolean {
    return this.modals.get(id)?.isOpen ?? false;
  }

  getModalZIndex(id: string): number {
    return this.modals.get(id)?.zIndex ?? this.baseZIndex;
  }

  getOpenModalsCount(): number {
    return Array.from(this.modals.values()).filter(m => m.isOpen).length;
  }
}

const modalManager = new ModalManager();

export function useModalManager(modalId: string) {
  const [, forceUpdate] = useState({});
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to modal manager updates
  if (!unsubscribeRef.current) {
    unsubscribeRef.current = modalManager.subscribe(() => {
      forceUpdate({});
    });
  }

  const openModal = useCallback(() => {
    return modalManager.openModal(modalId);
  }, [modalId]);

  const closeModal = useCallback(() => {
    modalManager.closeModal(modalId);
  }, [modalId]);

  const isOpen = modalManager.isModalOpen(modalId);
  const zIndex = modalManager.getModalZIndex(modalId);

  return {
    isOpen,
    openModal,
    closeModal,
    zIndex,
    openModalsCount: modalManager.getOpenModalsCount()
  };
}

export { modalManager };