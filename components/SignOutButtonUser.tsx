import { TouchableOpacity, Text, Platform, Modal, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/libs/supabase";
import { styles } from "@/assets/styles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { removeItem, getItem } from "@/utils/storage"; // Import removeItem
import { api, API_BASE_URL } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SignOutButtonUser = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const { language } = useLanguage();

  const handleSignOut = async () => {
    try {
      console.log("SignOutButtonUser - Attempting sign-out");
      // Unregister push token on server while auth still valid
      try {
        const pushToken = await getItem('pushToken');
        const deviceId = await getItem('deviceId');
        if (pushToken && API_BASE_URL) {
          console.log('SignOutButtonUser - Unregistering push token with backend', { token: pushToken, deviceId });
          try {
            const resp = await api.post('/noti/push/unregister', { token: pushToken, deviceId });
            console.log('SignOutButtonUser - unregister response:', resp?.status, resp?.data);
          } catch (err: any) {
            console.error('SignOutButtonUser - unregister error:', err?.response?.status, err?.response?.data || err?.message || err);
          }
        }
      } catch {
        console.error('SignOutButtonUser - failed to read pushToken before sign-out');
      }
      await supabase.auth.signOut();

      // Clear stored tokens
      await removeItem("authToken");
      await removeItem("userId");
      await removeItem("userProfile");
      await removeItem("userProfileImage");
      try {
        await AsyncStorage.removeItem("userProfile");
        await AsyncStorage.removeItem("userProfileImage");
      } catch {}

      console.log("SignOutButtonUser - Sign-out successful, navigating to /");
      try {
        await new Promise((res) => setTimeout(res, 200));
        if (typeof router.replace === "function") await router.replace("/");
      } catch {
        // ignore
      }
      try {
        if (typeof router.replace === "function") await router.replace("/(auth)/sign-in");
      } catch {
        // ignore
      }
      try {
        if (typeof router.push === "function") await router.push("/");
      } catch {
        // ignore
      }
    } catch (error) {
      console.error("SignOutButtonUser - Sign-out error:", error);
      // Even if sign out fails, attempt to navigate to (auth)"); page
      try {
        router.dismissAll();
      } catch {}
      router.replace("/");
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
          { marginTop: 15, marginLeft: 2 }, // Consistent margin for users
        ]}
        onPress={confirmSignOut}
        {...(Platform.OS !== "web"
          ? { onStartShouldSetResponder: () => true }
          : {})}
      >
        <Ionicons
          name="log-out"
          size={22}
          color={COLORS.text} // Standard text color for users
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
