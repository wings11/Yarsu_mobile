import { TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/libs/supabase";
import { getItem } from "@/utils/storage";
import { getUserRole, isAdminRole } from "@/services/authService";

export default function ChatButton() {
  const router = useRouter();
  const [chatId, setChatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateChat = async () => {
      const userId = await getItem("userId");
      if (!userId) {
        console.log("ChatButton - No userId found");
        setIsLoading(false);
        return;
      }

      console.log("ChatButton - Fetching chat for userId:", userId);
      const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows
          console.log("ChatButton - No chat found for userId:", userId);
          const { data: newChat, error: createError } = await supabase
            .from("chats")
            .insert({ user_id: userId })
            .select("id")
            .single();
          if (createError) {
            console.error(
              "ChatButton - Error creating chat:",
              createError.message
            );
          } else {
            console.log("ChatButton - Chat created, chatId:", newChat.id);
            setChatId(newChat.id);
          }
        } else {
          console.error("ChatButton - Error fetching chat:", error.message);
        }
      } else {
        console.log("ChatButton - Chat found, chatId:", data.id);
        setChatId(data.id);
      }
      setIsLoading(false);
    };

    fetchOrCreateChat();
  }, []);

  const handlePress = async () => {
    if (isLoading) {
      console.log("ChatButton - Still loading, please wait");
      return;
    }
    if (!chatId) {
      setIsLoading(true);
      // try re-fetch
      const userId = await getItem("userId");
      const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (data) {
        setChatId(data.id);
      }
      setIsLoading(false);
      if (!data?.id && !chatId) return;
    }

    try {
      const userData = await getUserRole();
      const admin = isAdminRole(userData.role);
      const path = admin ? "/(admin)/ChatScreenAdmin" : "/(root)/ChatScreen";
      router.push({ pathname: path, params: { chatId } });
    } catch (err) {
      console.error("ChatButton - Error fetching user role, falling back:", err);
      // Fallback to generic ChatScreen route
      router.push(`/ChatScreen?chatId=${chatId}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ padding: 10 }}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Image
          source={require("@/assets/images/chatuser.png")}
          style={{ width: 30, height: 30 }}
        />
      )}
    </TouchableOpacity>
  );
}
