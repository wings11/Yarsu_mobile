import React, { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { getUserRole, isAdminRole } from "@/services/authService";

interface ChatButtonProps {
  chatId: string; // The chat ID to pass to ChatScreen or ChatScreenAdmin
}

export default function ChatButton({ chatId }: ChatButtonProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getUserRole()
      .then((userData) => {
        setIsAdmin(isAdminRole(userData.role));
      })
      .catch((error) => {
        console.error("ChatButton - Error fetching user role:", error);
      });
  }, []);

  const handlePress = () => {
    const path = isAdmin ? "/(admin)/ChatScreenAdmin" : "/(root)/ChatScreen";
    router.push({ pathname: path, params: { chatId } });
  };

  return (
    <TouchableOpacity style={styles.tab} onPress={handlePress}>
      <Ionicons name="chatbubbles-outline" size={40} color={COLORS.shadow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 5,
  },
});
