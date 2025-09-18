import {
  TouchableOpacity,
  Text,
  Platform,
  Modal,
  View,
  
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/libs/supabase";
import { styles } from "@/assets/styles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { getUserRole, isAdminRole } from "@/services/authService";
import { removeItem, getItem } from "@/utils/storage";
import { api, API_BASE_URL } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

export const SignOutButton = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { language } = useLanguage();

  useEffect(() => {
    getUserRole()
      .then((userData) => {
        console.log("SignOutButton - User data:", userData);
  setIsAdmin(isAdminRole(userData.role));
      })
      .catch((error) => {
        console.error("SignOutButton - Error fetching user role:", error);
        setIsAdmin(false); // Default to non-admin if role fetch fails
      });
  }, []);

  const handleSignOut = async () => {
    try {
      console.log("SignOutButton - Attempting sign-out");
      // Try to unregister push token on server while auth is still valid
      try {
        const pushToken = await getItem('pushToken');
        const deviceId = await getItem('deviceId');
        if (pushToken && API_BASE_URL) {
          console.log('SignOutButton - Unregistering push token with backend', { token: pushToken, deviceId });
          try {
            const resp = await api.post('/noti/push/unregister', { token: pushToken, deviceId });
            console.log('SignOutButton - unregister response:', resp?.status, resp?.data);
          } catch {
            console.error('SignOutButton - unregister error');
          }
        }
      } catch {
        console.error('SignOutButton - failed to read pushToken before sign-out');
      }

      await supabase.auth.signOut();
      // Clear stored tokens and cached profile
      await removeItem("authToken");
      await removeItem("userId");
      await removeItem("userProfile");
      await removeItem("userProfileImage");
      // Also clear AsyncStorage keys used by UserContext
      try {
        await AsyncStorage.removeItem("userProfile");
        await AsyncStorage.removeItem("userProfileImage");
      } catch {
        // ignore
      }
      console.log("SignOutButton - Sign-out successful, navigating to /");
      // Robust navigation: try replace, then auth sign-in, then push as fallback
      try {
        await new Promise((res) => setTimeout(res, 200));
        if (typeof router.replace === "function") {
          await router.replace("/");
        }
      } catch {
        console.error("SignOutButton - navigation replace('/') failed");
      }
      try {
        // ensure we end up on auth/sign-in as a fallback
        if (typeof router.replace === "function") {
          await router.replace("/(auth)/sign-in");
        }
      } catch {
        // ignore
      }
      try {
        if (typeof router.push === "function") {
          await router.push("/");
        }
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error("SignOutButton - Sign-out error:", error);
    }
  };

  const confirmSignOut = () => {
    setModalVisible(true);
  };

  const handleYes = () => {
    setModalVisible(false);
    handleSignOut();
  };

  const handleNo = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.menuButton,
          styles.logoutButton,
          styles.menuItemContent,
          !isAdmin && { marginTop: 15, marginLeft: 2 }, // Margin for non-admin users
        ]}
        onPress={confirmSignOut}
        {...(Platform.OS !== "web"
          ? { onStartShouldSetResponder: () => true }
          : {})}
      >
        <Ionicons
          name="log-out"
          size={22}
          color={isAdmin ? COLORS.shadow : COLORS.text} // Black for admin, text color for user
        />
        <Text style={styles.menuText}>Log Out</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleNo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              {labels[language].signOutModalText}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleYes}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleNo}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
