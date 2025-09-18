// app/(admin)/dashboard.tsx
import { Text, View, FlatList, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/admin.styles";
import AdminCategoryGrid from "@/components/AdminCategoryGrid";
import { supabase } from "@/libs/supabase";
import { getUserRole, isAdminRole } from "@/services/authService";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

interface DashboardProps {
  toggleSidebar: () => void;
}

export default function Dashboard({ toggleSidebar }: DashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSignedIn(true);
        getUserRole()
          .then((userData) => {
            setUser(userData);
            setIsAdmin(isAdminRole(userData.role));
            setIsCheckingSession(false);
          })
          .catch((error) => {
            console.error("Error fetching user role:", error);
            setIsSignedIn(false);
            setIsCheckingSession(false);
          });
      } else {
        setIsSignedIn(false);
        setIsCheckingSession(false);
      }
    });
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isCheckingSession) {
    return null;
  }

  if (!isSignedIn || !isAdmin) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FlatList
          data={[{ key: "content" }]}
          renderItem={() => (
            <View>
              <View style={styles.greetingContainer}>
                {/* <Text style={styles.greetingText}>
                  {`${getGreeting()}, ${
                    user?.username || user?.email || "Admin"
                  }!`}
                </Text> */}
              </View>
              <AdminCategoryGrid />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.contentContainer}
        />
      </View>
    </View>
  );
}
