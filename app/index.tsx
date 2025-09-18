import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { styles } from "@/assets/styles/auth.styles";
import { supabase } from "@/libs/supabase";
import { getUserRole, isAdminRole } from "@/services/authService";
import { getItem, removeItem } from "@/utils/storage";
import usePushRegistration from '@/hooks/usePushRegistration';

export default function Index() {
  usePushRegistration();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status immediately when component mounts
  useEffect(() => {
    const checkAuthenticationAndRedirect = async () => {
      try {
        console.log("Index - Checking authentication status...");

        // Check for stored token first
        const storedToken = await getItem("authToken");

        // Check Supabase session
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (session || storedToken) {
          // User is authenticated, verify user data and redirect
          try {
            const userData = await getUserRole();
            if (userData && userData.id) {
              // Admins should go to admin dashboard first
              if (isAdminRole(userData.role)) {
                console.log("Index - Admin authenticated, redirecting to admin dashboard");
                setIsAuthenticated(true);
                router.replace("/(admin)/dashboard");
                return;
              }

              // Regular users go to home
              if (userData.role === "user") {
                console.log("Index - User is authenticated, redirecting to home");
                setIsAuthenticated(true);
                router.replace("/(root)/home");
                return;
              }
            }
          } catch (userError) {
            console.error("Index - Error getting user data:", userError);
            // If user data is invalid, clear tokens and stay on index
            await removeItem("authToken");
            await removeItem("userId");
          }
        }

        // User is not authenticated, show the welcome screen
        console.log(
          "Index - User is not authenticated, showing welcome screen"
        );
        setIsAuthenticated(false);
      } catch (error) {
        console.error("Index - Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthenticationAndRedirect();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Index - Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session) {
        try {
          const userData = await getUserRole();
          if (userData && userData.id) {
            if (isAdminRole(userData.role)) {
              console.log("Index - User signed in (admin), redirecting to admin dashboard");
              router.replace("/(admin)/dashboard");
            } else if (userData.role === "user") {
              console.log("Index - User signed in, redirecting to home");
              router.replace("/(root)/home");
            }
          }
        } catch (error) {
          console.error("Index - Error after sign in:", error);
        }
      }

      if (event === "SIGNED_OUT") {
        // Ensure local state and storage are cleared and show the main welcome/index
        console.log("Index - User signed out, clearing local auth state and routing to index");
        setIsAuthenticated(false);
        try {
          await removeItem("authToken");
          await removeItem("userId");
        } catch (err) {
          // ignore
        }
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleTapHere = () => {
    router.push("/(auth)");
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {/* <Text style={styles.welcomeText}>Loading...</Text> */}
      </View>
    );
  }

  // If user is authenticated, don't show anything (they should be redirected)
  if (isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {/* <Text style={styles.welcomeText}>Redirecting...</Text> */}
      </View>
    );
  }

  // Only show welcome screen for unauthenticated users
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/YarSu.png")}
        style={styles.illustration}
      />
      <TouchableOpacity onPress={handleTapHere}>
        <Text style={styles.taphere}>Tap Here</Text>
      </TouchableOpacity>
    </View>
  );
}
