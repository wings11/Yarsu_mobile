import { Stack, router, useFocusEffect } from "expo-router";
import { supabase } from "@/libs/supabase";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { getUserRole, isAdminRole } from "@/services/authService";
import { getItem, removeItem } from "@/utils/storage";

export default function RootLayout() {
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
              setUserRole(userData.role);
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
            setIsAuthenticated(true);
            setUserRole(userData.role);
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
              setUserRole(userData.role);
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
            setUserRole(userData.role);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("RootLayout - Error after sign in:", error);
          setIsAuthenticated(false);
        }
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserRole(null);
        // Only navigate to index if explicitly signed out
        router.replace("/");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle Android back button to prevent unwanted navigation
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isAuthenticated) {
          // If user is authenticated, prevent going back to auth screens
          // Let the individual screens handle their own back navigation
          return false; // Allow normal back navigation within authenticated screens
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
    <>
      {isAuthenticated ? (
        // For authenticated users, redirect based on role
        userRole === 'admin' || userRole === 'superadmin' ? (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(admin)" />
          </Stack>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(root)" />
          </Stack>
        )
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack>
      )}
      <StatusBar style="auto" />
    </>
  );
}
