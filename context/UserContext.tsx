import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../libs/supabase";
import { removeItem, getItem } from "../utils/storage";
import { api, getAuthToken, API_BASE_URL } from "../libs/api";
import { Platform } from 'react-native';

interface UserProfile {
  name: string;
  imageUrl?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  telegram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadImage: (file: any) => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    imageUrl: undefined,
    phoneNumber: "",
    address: "",
    email: "",
    telegram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Load profile from AsyncStorage
        const storedProfile = await AsyncStorage.getItem("userProfile");
        const storedImage = await AsyncStorage.getItem("userProfileImage");
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile((prev) => ({ ...prev, ...parsedProfile }));
        }
        if (storedImage) {
          setProfile((prev) => ({ ...prev, imageUrl: storedImage }));
        }
      } catch (error) {
        console.error("UserContext - Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
    // Helper to register stored push token with backend (used on mount and on SIGNED_IN)
    const registerStoredPushToken = async () => {
      try {
        const pushToken = await getItem("pushToken");
        if (!pushToken) return;
        if (!API_BASE_URL) {
          console.warn("UserContext - API_BASE_URL not set; skipping push registration");
          return;
        }
        let auth = await getAuthToken();
        if (!auth) {
          // give sign-in flows a brief moment to persist token
          await new Promise((r) => setTimeout(r, 500));
          auth = await getAuthToken();
        }
        if (!auth) {
          console.warn("UserContext - auth token not available; cannot register stored push token");
          return;
        }
            console.log('UserContext - (mount) registering stored push token with backend at', `${API_BASE_URL}/noti/push/register`);
        try {
          const resp = await api.post('/noti/push/register', { token: pushToken, platform: Platform.OS });
          console.log('UserContext - (mount) register response:', resp?.status, resp?.data);
        } catch (err: any) {
          console.error('UserContext - (mount) register error:', err?.response?.status, err?.response?.data || err?.message || err);
        }
      } catch (err) {
        console.error('UserContext - (mount) error registering stored push token:', err);
      }
    };

    // If a session already exists when provider mounts, attempt registration
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          await registerStoredPushToken();
        }
      } catch {
        // ignore
      }
    })();
    // Listen for auth state changes to clear profile on sign-out and register push token on sign-in
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        // Clear stored profile data so UI updates immediately
        (async () => {
          try {
            await AsyncStorage.removeItem("userProfile");
            await AsyncStorage.removeItem("userProfileImage");
            await removeItem("userProfile");
            await removeItem("userProfileImage");
            // reset in-memory profile
            setProfile({
              name: "",
              imageUrl: undefined,
              phoneNumber: "",
              address: "",
              email: "",
              telegram: "",
              facebook: "",
              tiktok: "",
              youtube: "",
            });
          } catch (err) {
            console.error("UserContext - Error clearing profile on sign out:", err);
          }
        })();
      }

      if (event === "SIGNED_IN") {
        // If a push token was obtained earlier (before auth), attempt to register it now.
        (async () => {
          try {
            // small delay to allow auth token to be persisted by sign-in flow
            await new Promise((r) => setTimeout(r, 500));
            const pushToken = await getItem("pushToken");
            if (!pushToken) {
              console.log("UserContext - No stored pushToken to register");
              return;
            }
            if (!API_BASE_URL) {
              console.warn("UserContext - API_BASE_URL not set; skipping push registration");
              return;
            }

            // Ensure an auth token is available (axios interceptor will attach it). Retry once if missing.
            let auth = await getAuthToken();
            if (!auth) {
              console.log("UserContext - auth token not yet available; retrying registration shortly");
              await new Promise((r) => setTimeout(r, 1000));
              auth = await getAuthToken();
            }
            if (!auth) {
              console.warn("UserContext - auth token still not available; skipping push registration");
              return;
            }

            console.log('UserContext - Registering stored push token with backend at', `${API_BASE_URL}/noti/push/register`);
            try {
              const resp = await api.post('/noti/push/register', { token: pushToken, platform: Platform.OS });
              console.log('UserContext - register response:', resp?.status, resp?.data);
            } catch (err: any) {
              console.error('UserContext - register error after sign-in:', err?.response?.status, err?.response?.data || err?.message || err);
            }
          } catch (err) {
            console.error('UserContext - Error registering push token after sign-in:', err);
          }
        })();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      // Persist to AsyncStorage
      await AsyncStorage.setItem("userProfile", JSON.stringify(newProfile));
    } catch (error) {
      console.error("UserContext - Error updating profile:", error);
    }
  };

  const uploadImage = async (file: any) => {
    try {
      // Store the image URI directly in AsyncStorage (or convert to base64 if needed)
      const imageUri = file.uri;
      await AsyncStorage.setItem("userProfileImage", imageUri);
      await updateProfile({ imageUrl: imageUri });
      return imageUri;
    } catch (error) {
      console.error("UserContext - Error uploading image:", error);
      return null;
    }
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, uploadImage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
