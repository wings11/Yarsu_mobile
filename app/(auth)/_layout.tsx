import { Stack, router, useFocusEffect } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useEffect, useCallback } from "react";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";
import { BackHandler } from "react-native";

export default function AuthRoutesLayout() {
  // Prevent authenticated users from accessing auth screens
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const storedToken = await getItem("authToken");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session || storedToken) {
          // User is already authenticated, redirect them away from auth screens
          try {
            const userData = await getUserRole();
            if (
              userData &&
              userData.id &&
              (userData.role === "user" || userData.role === "admin")
            ) {
              console.log(
                "AuthLayout - Redirecting authenticated user to home"
              );
              router.replace("/(root)/home");
            }
          } catch (error) {
            console.error(
              "AuthLayout - Error redirecting authenticated user:",
              error
            );
          }
        }
      } catch (error) {
        console.error("AuthLayout - Error checking auth:", error);
      }
    };

    checkAuthAndRedirect();
  }, []);

  // Handle back button in auth screens to prevent going back to app/index.tsx
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent going back to app/index.tsx from auth screens
        // Return true to prevent default back behavior
        console.log(
          "AuthLayout - Preventing back navigation to index from auth screens"
        );
        return true; // This prevents going back to app/index.tsx
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            gestureEnabled: false, // Disable swipe back gesture
          }}
        />
        <Stack.Screen
          name="sign-in"
          options={{
            gestureEnabled: true, // Disable swipe back gesture
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            gestureEnabled: false, // Disable swipe back gesture
          }}
        />
      </Stack>
    </KeyboardAwareScrollView>
  );
}
