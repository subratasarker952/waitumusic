// Navigation safety utilities to prevent navigation issues

export const navigationSafety = {
  // Prevent navigation during critical operations
  isNavigationBlocked: false,
  blockingReasons: new Set<string>(),

  blockNavigation(reason: string) {
    this.isNavigationBlocked = true;
    this.blockingReasons.add(reason);
  },

  unblockNavigation(reason: string) {
    this.blockingReasons.delete(reason);
    if (this.blockingReasons.size === 0) {
      this.isNavigationBlocked = false;
    }
  },

  canNavigate(): boolean {
    return !this.isNavigationBlocked;
  },

  getBlockingReasons(): string[] {
    return Array.from(this.blockingReasons);
  },

  // Safe navigation wrapper
  safeNavigate(navigateFn: () => void) {
    if (this.canNavigate()) {
      navigateFn();
    } else {
      console.warn('Navigation blocked:', this.getBlockingReasons());
    }
  },

  // Reset all blocks (use with caution)
  reset() {
    this.isNavigationBlocked = false;
    this.blockingReasons.clear();
  }
};