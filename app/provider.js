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

  // Query YouTube connection status
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
    if (youtubeToken !== undefined) {
      setYoutubeConnected(!!youtubeToken);
    }
  }, [youtubeToken]);

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
