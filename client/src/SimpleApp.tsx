import React from 'react';

export default function SimpleApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      marginTop: '50px',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#333' }}>WaituMusic Platform</h1>
      <p style={{ color: '#666' }}>Welcome to the music industry management platform</p>
      <div style={{ marginTop: '30px' }}>
        <a href="/login" style={{
          display: 'inline-block',
          padding: '10px 30px',
          backgroundColor: '#7C3AED',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          Go to Login
        </a>
      </div>
    </div>
  );
}