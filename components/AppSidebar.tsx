import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { styles } from "@/assets/styles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { SignOutButtonUser } from "@/components/SignOutButtonUser";

interface AppSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function AppSidebar({ isOpen, toggleSidebar }: AppSidebarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const translateX = useRef(new Animated.Value(isOpen ? 0 : -250)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSignedIn(true);
        getUserRole()
          .then((userData) => {
            setUser(userData);
          })
          .catch((error) => {
            console.error("Error fetching user role:", error);
            setIsSignedIn(false);
          });
      } else {
        setIsSignedIn(false);
        setUser(null);
      }
    });
  }, []);

  const handleChangePassword = () => {
    router.push("/change-password");
    toggleSidebar();
  };

  const navigationItems = [{ name: "Home", icon: "home", route: "/home" }];

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 99,
          }}
          onPress={toggleSidebar}
          onStartShouldSetResponder={() => true}
        />
      )}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX }],
            width: 250,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 100,
            backgroundColor: COLORS.background,
            shadowColor: COLORS.text,
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          {isSignedIn ? (
            <View style={styles.userContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.slice(0, 2).toUpperCase() ||
                    user?.email?.split("@")[0].slice(0, 2).toUpperCase() ||
                    "US"}
                </Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.usernameText}>
                  {user?.username || user?.email?.split("@")[0] || "User"}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.welcomeText}>Please sign in</Text>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleSidebar}
            onStartShouldSetResponder={() => true}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={styles.sidebarContent}>
          <View style={styles.sidebarGroup}>
            <Text style={styles.groupLabel}>Navigation</Text>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuButton,
                  router.pathname === item.route && styles.activeMenuButton,
                ]}
                onPress={() => {
                  router.push(item.route);
                  toggleSidebar();
                }}
                onStartShouldSetResponder={() => true}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={
                      router.pathname === item.route
                        ? COLORS.white
                        : COLORS.text
                    }
                  />
                  <Text
                    style={[
                      styles.menuText,
                      router.pathname === item.route && styles.activeMenuText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {isSignedIn && (
            <View style={styles.sidebarGroup}>
              <Text style={styles.groupLabel}>Account</Text>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handleChangePassword}
                onStartShouldSetResponder={() => true}
              >
                {/* <View style={styles.menuItemContent}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.text} />
                  <Text style={styles.menuText}>Change Password</Text>
                </View> */}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.logoutButton]}>
                <View style={styles.menuItemContent}>
                  <SignOutButtonUser />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </>
  );
}
