/**
 * Simple preview component for embedded iframe display
 * Shows basic WaituMusic branding when in small iframe
 */
import React from 'react';

interface IframePreviewProps {
  isIframe: boolean;
}

export function IframePreview({ isIframe }: IframePreviewProps) {
  React.useEffect(() => {
    console.log('IframePreview rendering, isIframe:', isIframe);
  }, [isIframe]);
  
  if (!isIframe) return null;
  
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#000000',
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: '9999'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #EF4444 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>
        Wai'tuMusic
      </div>
      <div style={{
        fontSize: '14px',
        color: '#666666',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Music Industry Management Platform
      </div>
      <div style={{
        fontSize: '12px',
        color: '#888888',
        textAlign: 'center',
        lineHeight: '1.5'
      }}>
        • Artist & Musician Management<br/>
        • Newsletter & Press Release System<br/>
        • Booking & Revenue Optimization<br/>
        • Industry Contact Network
      </div>
      <div style={{
        marginTop: '30px',
        padding: '8px 16px',
        backgroundColor: '#7C3AED',
        color: 'white',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer'
      }} onClick={() => {
        if (window.parent !== window) {
          window.parent.postMessage('expand-preview', '*');
        }
      }}>
        Click to Expand Full Application
      </div>
    </div>
  );
}

export default IframePreview;