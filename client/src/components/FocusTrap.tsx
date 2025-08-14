import { useEffect, useRef } from 'react';
import FocusTrapReact from 'focus-trap-react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  paused?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  returnFocusOnDeactivate?: boolean;
}

export function FocusTrap({ 
  children, 
  active = true,
  paused = false,
  initialFocusRef,
  returnFocusOnDeactivate = true
}: FocusTrapProps) {
  return (
    <FocusTrapReact
      active={active}
      paused={paused}
      focusTrapOptions={{
        initialFocus: initialFocusRef?.current || undefined,
        returnFocusOnDeactivate,
        allowOutsideClick: true,
        clickOutsideDeactivates: false,
        escapeDeactivates: false,
        fallbackFocus: '[role="dialog"]'
      }}
    >
      <div>{children}</div>
    </FocusTrapReact>
  );
}