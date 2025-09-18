import React, { useEffect, useRef, useState } from "react";
import { useRouter, useNavigation } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Image,
  BackHandler,
} from "react-native";
import { styles } from "@/assets/styles/adminstyles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { SignOutButton } from "@/components/SignOutButton";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function AdminSidebar({
  isOpen,
  toggleSidebar,
}: AdminSidebarProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();
  const { profile } = useUser();
  const translateX = useRef(new Animated.Value(isOpen ? 0 : -250)).current;

  // Disable swipe-back gesture
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  // Block hardware back button (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  // Block navigation back attempts
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Allow programmatic navigation (replace/push). Only block hardware/back POP actions.
      const actionType = (e?.data as any)?.action?.type;
      if (actionType === 'POP' || actionType === 'POP_TO_TOP') {
        e.preventDefault();
      }
      // otherwise allow navigation events (e.g., REPLACE, PUSH)
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  // Assume admin role for local development
  const isAdmin = true; // Replace with actual logic if needed (e.g., check AsyncStorage)

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(root)");
    }
  }, [isAdmin]);

  const handleChangePassword = () => {
    router.push("/forgetPassword");
    toggleSidebar();
  };

  const handleEditProfile = () => {
    router.push("/editProfile");
    toggleSidebar();
  };

  const handleLanguageChange = (lang: "en" | "my") => {
    setLanguage(lang);
    toggleSidebar();
  };

  const getDisplayText = () => {
    if (profile.name) {
      return {
        avatarText: profile.name.slice(0, 2).toUpperCase(),
        username: profile.name,
      };
    }
    const email = profile.email || "Admin";
    const username = email.split("@")[0];
    return {
      avatarText: username.slice(0, 2).toUpperCase(),
      username,
    };
  };

  const { avatarText, username } = getDisplayText();

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
          activeOpacity={1}
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
          <View style={styles.userContainer}>
            <View style={styles.avatar}>
              {profile.imageUrl ? (
                <Image
                  source={{ uri: profile.imageUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{avatarText}</Text>
              )}
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>{username}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={toggleSidebar}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={styles.groupLabel}
            onPress={() => router.push("/(admin)/dashboard")}
          >
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>
          <View style={styles.sidebarGroup}>
            <Text style={styles.groupLabel}>Account</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleEditProfile}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="person" size={20} color={COLORS.shadow} />
                <Text style={styles.menuText}>Edit Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleChangePassword}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="lock-closed" size={20} color={COLORS.shadow} />
                <Text style={styles.menuText}>Change Password</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, styles.logoutButton]}>
              <View style={styles.menuItemContent}>
                <SignOutButton />
              </View>
            </TouchableOpacity>
            <View style={styles.lanButton}>
              <TouchableOpacity onPress={() => handleLanguageChange("my")}>
                <Image
                  source={require("@/assets/images/MY.png")}
                  style={[styles.logo]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.separatorcol} />
              <TouchableOpacity onPress={() => handleLanguageChange("en")}>
                <Image
                  source={require("@/assets/images/US.png")}
                  style={[styles.logo]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
