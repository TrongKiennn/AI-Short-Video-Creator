'use client';
import React, { useState, useEffect } from 'react';
import { auth } from '@/configs/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuthContext } from '@/app/provider';

function Authentication({ children }) {
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [authStep, setAuthStep] = useState('firebase'); // 'firebase' | 'youtube' | 'complete'
  const { user } = useAuthContext();

  const provider = new GoogleAuthProvider();

  const onSignInClick = async () => {
    if (user) {
      // User is already signed in, no need to sign in again
      return;
    }

    try {
      setAuthStep('firebase');

      // Only sign in with Firebase/Gmail
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      console.log('Firebase auth successful:', firebaseUser);

      // Reset auth step after successful Firebase auth
      setAuthStep('firebase');
      setIsConnectingYouTube(false);
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthStep('firebase');
      setIsConnectingYouTube(false);

      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
      } else if (error.code === 'auth/popup-blocked') {
        console.log('Popup was blocked');
      }
    }
  };

  // Check if user just came back from YouTube OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('youtube_connected') === 'true') {
      setAuthStep('complete');
      setIsConnectingYouTube(false);

      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Show success message briefly
      setTimeout(() => {
        setAuthStep('firebase');
      }, 2000);
    }
  }, []);

  const getLoadingMessage = () => {
    switch (authStep) {
      case 'firebase':
        return 'Signing in with Google...';
      case 'complete':
        return 'Successfully connected!';
      default:
        return 'Loading...';
    }
  };

  return (
    <div onClick={onSignInClick} style={{ position: 'relative' }}>
      {(isConnectingYouTube || authStep === 'complete') && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            borderRadius: '8px',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {authStep === 'complete' ? (
              <div>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>✓</div>
                <div>{getLoadingMessage()}</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <div
                    className="animate-spin"
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      margin: '0 auto',
                    }}
                  ></div>
                </div>
                <div>{getLoadingMessage()}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default Authentication;
