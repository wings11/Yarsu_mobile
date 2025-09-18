import React, { useEffect, useState, useRef } from "react";
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
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/libs/supabase";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
  chat_id: string;
}

interface Chat {
  id: string;
  user_id: string;
  created_at: string;
  last_message?: Message;
}

export default function ChatScreenAdmin() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatIdFromRoute = params.chatId as string | undefined;
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    chatIdFromRoute || null
  );
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 600;

  // Update screen width on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const fetchMessages = async () => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    setLoading(false);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, message, created_at, chat_id")
        .eq("chat_id", selectedChatId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("ChatScreenAdmin - Error fetching messages:", err);
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const registerPushToken = async (userId) => {
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

    const initializeAdmin = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        setAdminId(id);
        if (id) await registerPushToken(id);

        if (!id || !(await checkAdminRole(id))) {
          console.error("ChatScreenAdmin - No valid admin ID or role");
          setLoading(false);
          router.replace("/(auth)");
          return;
        }

        await fetchChats();
      } catch (error) {
        console.error("ChatScreenAdmin - Error initializing admin:", error);
        setLoading(false);
        router.replace("/(auth)");
      }
    };

    initializeAdmin();
  }, [router]);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data.role === "admin" || data.role === "superadmin";
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select(
          `
          id,
          user_id,
          created_at,
          messages (
            id,
            sender_id,
            message,
            created_at,
            chat_id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (chatError) throw chatError;

      const chatsWithLastMessage = chatData
        .map((chat) => ({
          ...chat,
          last_message:
            chat.messages.length > 0
              ? chat.messages.reduce((latest, current) =>
                  new Date(latest.created_at) > new Date(current.created_at)
                    ? latest
                    : current
                )
              : undefined,
        }))
        .sort(
          (a, b) =>
            (b.last_message?.created_at
              ? new Date(b.last_message.created_at)
              : new Date(b.created_at)) -
            (a.last_message?.created_at
              ? new Date(a.last_message.created_at)
              : new Date(a.created_at))
        );

      setChats(chatsWithLastMessage);
      setFilteredChats(chatsWithLastMessage);
      // Only auto-select first chat on large screens if no chatId from route
      if (!selectedChatId && chatsWithLastMessage.length > 0 && isLargeScreen) {
        setSelectedChatId(chatsWithLastMessage[0].id);
      }
    } catch (err) {
      console.error("ChatScreenAdmin - Error fetching chats:", err);
      setChats([]);
      setFilteredChats([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedChatId]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedChatId || !adminId) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        chat_id: selectedChatId,
        sender_id: adminId,
        message: input,
        type: "text",
      });
      if (error) throw error;
      setInput("");
      await fetchMessages();
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error("ChatScreenAdmin - Error sending message:", err);
    }
    setSending(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(
        (chat) =>
          chat.user_id.toLowerCase().includes(query.toLowerCase()) ||
          (chat.last_message?.message &&
            chat.last_message.message
              .toLowerCase()
              .includes(query.toLowerCase()))
      );
      setFilteredChats(filtered);
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        selectedChatId === item.id && styles.selectedChatItem,
      ]}
      onPress={() => {
        setSelectedChatId(item.id);
      }}
    >
      <Text style={styles.chatUserId}>User: {item.user_id.slice(0, 8)}...</Text>
      <Text style={styles.chatLastMessage}>
        {item.last_message?.message
          ? `Last: ${item.last_message.message.slice(0, 20)}...`
          : "No messages yet"}
      </Text>
      <Text style={styles.chatTimestamp}>
        {item.last_message?.created_at
          ? new Date(item.last_message.created_at).toLocaleTimeString()
          : new Date(item.created_at).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender_id === adminId ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.senderLabel}>
        {item.sender_id === adminId ? "You (Admin)" : "User"}
      </Text>
      <Text>{item.message}</Text>
      <Text style={styles.messageTimestamp}>
        {item.created_at ? new Date(item.created_at).toLocaleTimeString() : ""}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Chats...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        {isLargeScreen ? (
          // Large Screen Layout
          <View style={styles.largeScreenContainer}>
            <View style={styles.chatListContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search chats..."
              />
              <FlatList
                data={filteredChats}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                style={styles.chatList}
                ListEmptyComponent={
                  <Text style={styles.noChatText}>No chats found</Text>
                }
              />
            </View>
            <View style={styles.chatAreaContainer}>
              {selectedChatId ? (
                <>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatHeaderText}>
                      User:{" "}
                      {chats
                        .find((chat) => chat.id === selectedChatId)
                        ?.user_id.slice(0, 8)}
                      ...
                    </Text>
                  </View>
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    onContentSizeChange={() =>
                      flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    onLayout={() =>
                      flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    contentContainerStyle={{ paddingBottom: 70 }}
                  />
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
                      disabled={sending || !selectedChatId}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.noChatContainer}>
                  <Text style={styles.noChatText}>Select a chat to start</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          // Mobile Layout
          <>
            {!selectedChatId ? (
              <View style={styles.chatListContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search chats..."
                />
                <FlatList
                  data={filteredChats}
                  renderItem={renderChatItem}
                  keyExtractor={(item) => item.id}
                  style={styles.chatList}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  ListEmptyComponent={
                    <Text style={styles.noChatText}>No chats found</Text>
                  }
                />
              </View>
            ) : (
              <View style={styles.chatAreaContainer}>
                <View style={styles.chatHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedChatId(null)}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.chatHeaderText}>
                    User:{" "}
                    {chats
                      .find((chat) => chat.id === selectedChatId)
                      ?.user_id.slice(0, 8)}
                    ...
                  </Text>
                </View>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  onLayout={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  contentContainerStyle={{ paddingBottom: 70 }}
                />
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
                    disabled={sending || !selectedChatId}
                  />
                </View>
              </View>
            )}
          </>
        )}
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
  largeScreenContainer: {
    flex: 1,
    flexDirection: "row",
  },
  chatListContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#eee",
    maxWidth: 300,
  },
  chatAreaContainer: {
    flex: 2,
    position: "relative",
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  selectedChatItem: {
    backgroundColor: "#f0f0f0",
  },
  chatUserId: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatLastMessage: {
    fontSize: 14,
    color: "#666",
  },
  chatTimestamp: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 10,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  chatHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  backButton: {
    padding: 5,
  },
  inputRowFixed: {
    flexDirection: "row",
    alignItems: "center",
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
  messageTimestamp: {
    fontSize: 10,
    color: "#888",
    textAlign: "right",
    marginTop: 2,
  },
  noChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noChatText: {
    fontSize: 16,
    color: "#666",
  },
});
