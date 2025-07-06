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

  // Add YouTube scope for seamless OAuth
  provider.addScope('https://www.googleapis.com/auth/youtube.upload');

  const onSignInClick = async () => {
    if (user) {
      // User is already signed in, just connect YouTube
      await connectYouTube(user);
      return;
    }

    try {
      setAuthStep('firebase');

      // First, sign in with Firebase
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const firebaseUser = result.user;

      console.log('Firebase auth successful:', firebaseUser);

      // Wait a moment for the provider to update the user context
      setTimeout(async () => {
        await connectYouTube(firebaseUser);
      }, 500);
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

  const connectYouTube = async (firebaseUser) => {
    if (!firebaseUser) return;

    setAuthStep('youtube');
    setIsConnectingYouTube(true);

    try {
      // Get the user's Convex ID from the context or wait for it
      let convexUser = user;

      // If user context is not ready, wait a bit and try again
      if (!convexUser?._id) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        convexUser = user;
      }

      if (!convexUser?._id) {
        console.error('Convex user ID not found, retrying...');
        // Try to get user from Firebase directly
        const tempUser = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };

        // Call connect API without userId for now
        const response = await fetch('/api/youtube/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          }),
        });

        if (response.ok) {
          const { authUrl } = await response.json();
          // Store user info in sessionStorage for the callback
          sessionStorage.setItem(
            'pendingYouTubeAuth',
            JSON.stringify({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              firebaseUid: firebaseUser.uid,
            })
          );
          window.location.href = authUrl;
        } else {
          const error = await response.json();
          console.error('YouTube connect error:', error);
          setIsConnectingYouTube(false);
          setAuthStep('firebase');
        }
        return;
      }

      // Call the connect API to get the YouTube auth URL
      const response = await fetch('/api/youtube/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: convexUser._id,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        }),
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        const error = await response.json();
        console.error('YouTube connect error:', error);
        setIsConnectingYouTube(false);
        setAuthStep('firebase');
      }
    } catch (error) {
      console.error('YouTube connection error:', error);
      setIsConnectingYouTube(false);
      setAuthStep('firebase');
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
      case 'youtube':
        return 'Connecting to YouTube...';
      case 'complete':
        return 'Successfully connected!';
      default:
        return 'Loading...';
    }
  };

  return (
    <div onClick={onSignInClick} style={{ position: 'relative' }}>
      {(isConnectingYouTube || authStep !== 'firebase') && (
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
