import React, { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/libs/supabase";
import * as SecureStore from "expo-secure-store";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
  type: string;
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const fetchMessages = React.useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, message, created_at, type")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([]);
    }
    setLoading(false);
  }, [chatId]);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const registerPushToken = async (userId: string) => {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      // TODO: Replace with real auth token
      const authToken = await SecureStore.getItemAsync("authToken");
      await fetch("https://yarsu-backend.onrender.com/api/noti/push/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token, platform: "android", deviceId: Device.osBuildId }),
      });
    };

    const fetchUserAndMessages = async () => {
      const id = await SecureStore.getItemAsync("userId");
      setUserId(id);
      if (id) await registerPushToken(id);
      await fetchMessages();
    };

    fetchUserAndMessages();

    const subscription = supabase
      .channel(`public:messages:chat_id=eq.${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [chatId, fetchMessages]);

  const sendMessage = async () => {
    if (!input.trim() || !userId || !chatId) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: userId,
        message: input,
        type: "text",
      });
      if (error) throw error;
      setInput("");
      await fetchMessages();
    } catch (err) {
      console.error("Send message error:", err);
    }
    setSending(false);
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.type === "card") {
      let cardData;
      try {
        cardData = JSON.parse(item.message);
      } catch (err) {
        console.error("Error parsing card message:", err);
        return null;
      }
      return (
        <View
          style={[
            styles.messageBubble,
            item.sender_id === userId ? styles.myMessage : styles.otherMessage,
            styles.cardContainer,
          ]}
        >
          <Text style={styles.senderLabel}>
            {item.sender_id === userId ? "You" : "Other"}
          </Text>
          <Text style={styles.cardTitle}>Job Application</Text>
          <Text style={styles.cardField}>
            Job: {cardData.job_title || "N/A"}
          </Text>
          <Text style={styles.cardField}>Name: {cardData.name || "N/A"}</Text>
          <Text style={styles.cardField}>
            Phone: {cardData.phonenumber || "N/A"}
          </Text>
          <Text style={styles.cardField}>
            Address: {cardData.address || "N/A"}
          </Text>
          <Text style={styles.cardField}>
            Birthday: {cardData.birthday || "N/A"}
          </Text>
          <Text style={styles.cardField}>
            Thai Language: {cardData.thailanguage || "N/A"}
          </Text>
          <Text style={styles.cardField}>
            Gender: {cardData.gender || "N/A"}
          </Text>
          {item.created_at && (
            <Text style={styles.cardTimestamp}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          )}
        </View>
      );
    }
    return (
      <View
        style={[
          styles.messageBubble,
          item.sender_id === userId ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.senderLabel}>
          {item.sender_id === userId ? "You" : "Other"}
        </Text>
        <Text>{item.message}</Text>
        {item.created_at && (
          <Text style={styles.messageTimestamp}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            contentContainerStyle={{ paddingBottom: 70 }}
            ListEmptyComponent={<Text>No messages yet</Text>}
          />
        )}
        <View style={styles.inputRowFixed}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Type a message..."
          />
          <Button
            title={sending ? "Sending..." : "Send"}
            onPress={sendMessage}
            disabled={sending || !input.trim() || !chatId}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    paddingTop: 40,
  },
  inputRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  messageBubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#F1F0F0",
    alignSelf: "flex-start",
  },
  senderLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  cardContainer: {
    backgroundColor: "#E6F0FA",
    borderWidth: 1,
    borderColor: "#ADD8E6",
    padding: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  cardField: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  cardTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end",
  },
});
