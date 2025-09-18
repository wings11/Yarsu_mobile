import { Stack, router, useFocusEffect } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { supabase } from "@/libs/supabase";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AppLayout from "@/components/AppLayout";
import { getUserRole, isAdminRole } from "@/services/authService";
import { getItem, removeItem } from "@/utils/storage";

export default function RootLayout() {
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuthenticationStatus = async () => {
    try {
      console.log("RootLayout - Checking session...");

      // Check for stored token first
      const storedToken = await getItem("authToken");

      // Check Supabase session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("RootLayout - Session check error:", error.message);

        // If there's an error but we have a stored token, try to use it
        if (storedToken) {
          try {
            const userData = await getUserRole();
            if (
              userData &&
              userData.id &&
              (userData.role === "user" || isAdminRole(userData.role))
            ) {
              console.log(
                "RootLayout - Using stored token, user authenticated"
              );
              setIsAuthenticated(true);
              return true;
            }
          } catch (userError) {
            console.error(
              "RootLayout - Error getting user data from stored token:",
              userError
            );
            // Clear invalid token
            await removeItem("authToken");
            await removeItem("userId");
          }
        }

        setIsAuthenticated(false);
        return false;
      } else if (session) {
        console.log(
          "RootLayout - Session found:",
          session.user.email,
          session.user.id
        );

        try {
          const userData = await getUserRole();
          if (
            userData &&
            userData.id &&
            (userData.role === "user" || isAdminRole(userData.role))
          ) {
            // If user is admin or superadmin, they shouldn't be in (root) route
            if (isAdminRole(userData.role)) {
              router.replace("/(admin)");
              return false;
            }
            setIsAuthenticated(true);
            return true;
          } else {
            console.log("RootLayout - Invalid user role or data:", userData);
            setIsAuthenticated(false);
            return false;
          }
        } catch (userError) {
          console.error("RootLayout - Error getting user data:", userError);
          setIsAuthenticated(false);
          return false;
        }
      } else {
        console.log("RootLayout - No session found");

        // Check if we have a stored token as fallback
        if (storedToken) {
          try {
            const userData = await getUserRole();
            if (
              userData &&
              userData.id &&
              (userData.role === "user" || isAdminRole(userData.role))
            ) {
              console.log(
                "RootLayout - Using stored token, user authenticated"
              );
              setIsAuthenticated(true);
              return true;
            }
          } catch (userError) {
            console.error(
              "RootLayout - Error getting user data from stored token:",
              userError
            );
            // Clear invalid token
            await removeItem("authToken");
            await removeItem("userId");
          }
        }

        setIsAuthenticated(false);
        return false;
      }
    } catch (error: any) {
      console.error("RootLayout - Error checking session:", error.message);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      await checkAuthenticationStatus();
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log(
        "RootLayout - Auth state changed:",
        event,
        session?.user?.email
      );

      if (event === "SIGNED_IN" && session) {
        try {
          const userData = await getUserRole();
          if (
            userData &&
            userData.id &&
            (userData.role === "user" || isAdminRole(userData.role))
          ) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("RootLayout - Error after sign in:", error);
          setIsAuthenticated(false);
        }
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        // Only navigate to index if explicitly signed out
        router.replace("/");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle Android back button to prevent unwanted navigation for authenticated users
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isAuthenticated) {
          // For authenticated users, prevent going back to app/index.tsx
          console.log(
            "RootLayout - Preventing back navigation for authenticated user"
          );
          return true; // Prevent default back behavior
        }
        return false; // Allow normal back navigation for non-authenticated screens
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [isAuthenticated])
  );

  if (isCheckingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeScreen>
      {isAuthenticated ? (
        // For authenticated users, only show the authenticated stack
        // app/index.tsx is completely excluded from this stack
        <AppLayout>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="home"
              options={{
                gestureEnabled: false, // Disable swipe gesture for Home
              }}
            />
            <Stack.Screen
              name="ChatScreen"
              options={{
                title: "Chat",
                gestureEnabled: false, // Disable swipe gesture for ChatScreen
              }}
            />
            {/* Add other user screens here */}
          </Stack>
        </AppLayout>
      ) : (
        // For non-authenticated users, show the unauthenticated stack
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack>
      )}
      <StatusBar style="auto" />
    </SafeScreen>
  );
}
