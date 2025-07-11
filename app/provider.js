'use client';
import React, { useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/configs/firebaseConfig';
import { AuthContext } from './_context/AuthContext';
import {
  ConvexProvider,
  ConvexReactClient,
  useMutation,
  useQuery,
} from 'convex/react';
import { api } from '@/convex/_generated/api';

function Provider({ children }) {
  const [user, setUser] = useState();
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const CreateUser = useMutation(api.users.CreateNewUser);

  // Query YouTube connection status - only when user is available
  const youtubeToken = useQuery(
    api.youtubeTokens.getYouTubeToken,
    user?._id ? { userId: user._id } : 'skip'
  );

  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUser(null);
        setYoutubeConnected(false);
        return;
      }

      const result = await CreateUser({
        name: user?.displayName,
        email: user?.email,
        pictureURL: user?.photoURL,
      });

      const combinedUser = {
        ...user,
        _id: result?._id,
      };

      setUser(combinedUser);
    });
    return () => unsubcribe();
  }, []);

  // Update YouTube connection status when token data changes
  useEffect(() => {
    console.log('Provider: YouTube token check', {
      hasUser: !!user?._id,
      userId: user?._id,
      youtubeToken: youtubeToken,
      isUndefined: youtubeToken === undefined,
    });

    if (user?._id) {
      if (youtubeToken !== undefined) {
        // Only set as connected if there's a user-specific token
        const connected = !!youtubeToken;
        console.log('Provider: Setting YouTube connected status:', connected);
        setYoutubeConnected(connected);
      } else {
        // If we have a user but no token data yet, wait for the query
        console.log(
          'Provider: User exists but no token data yet, setting false'
        );
        setYoutubeConnected(false);
      }
    } else {
      // No user, definitely not connected
      console.log('Provider: No user, setting YouTube connected to false');
      setYoutubeConnected(false);
    }
  }, [youtubeToken, user?._id]);

  return (
    <div>
      <AuthContext.Provider value={{ user, youtubeConnected }}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </AuthContext.Provider>
    </div>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  return context;
};
export default Provider;
