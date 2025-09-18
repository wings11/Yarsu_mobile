// app/(admin)/_layout.tsx
import { Stack, router } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { replaceOnce } from "@/utils/redirectGuard";
import { getUserRole, isAdminRole } from "@/services/authService";
import { UserProvider } from "@/context/UserContext";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";

export default function ALayout() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getUserRole()
          .then((userData) => {
            setIsCheckingSession(false);
            if (!isAdminRole(userData.role)) {
              replaceOnce(router, "./(root)");
            }
          })
          .catch((error) => {
            console.error("Error fetching user role:", error);
      setIsCheckingSession(false);
      replaceOnce(router, "./(auth)");
          });
      } else {
        setIsCheckingSession(false);
    replaceOnce(router, "./(auth)");
      }
    });
  }, []);

  if (isCheckingSession) {
    return null;
  }

  return (
    <UserProvider>
      <SafeScreen>
        <AdminLayout>
          <Stack screenOptions={{ headerShown: false }} />
        </AdminLayout>
        <StatusBar style="dark" />
      </SafeScreen>
    </UserProvider>
  );
}
