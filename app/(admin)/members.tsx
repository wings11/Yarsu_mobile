import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/libs/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { styles } from "@/assets/styles/adminstyles/members.styles";

type MemberType = {
  id: string;
  username: string;
  email: string;
  role: string;
};

type MemberProps = {
  members?: MemberType[]; // Optional prop to pass members
  onAddMember?: (member: MemberType) => void; // Optional callback for adding members
};

const Member = ({ members = [], onAddMember }: MemberProps) => {
  const router = useRouter();
  const { language } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [newMember, setNewMember] = useState({
    username: "",
    email: "",
    role: "member",
  });

  const handleAddMember = useCallback(async () => {
    if (!newMember.username || !newMember.email) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            username: newMember.username,
            email: newMember.email,
            role: newMember.role,
          },
        ])
        .select();
      if (error) {
        console.error("Error adding member:", error);
        Alert.alert("Error", "Failed to add member.");
      } else if (data) {
        if (onAddMember) {
          onAddMember(data[0]);
        }
        setModalVisible(false);
        setNewMember({ username: "", email: "", role: "member" });
        Alert.alert(
          "Success",
          labels[language].saved || "Member added successfully!"
        );
      }
    } catch (error) {
      console.error("Error adding member:", error);
      Alert.alert("Error", "Failed to add member.");
    }
  }, [newMember, onAddMember, language]);

  const renderMember = ({ item }: { item: MemberType }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.username}</Text>
      <Text style={styles.tableCell}>{item.email}</Text>
      <Text style={styles.tableCell}>{item.role}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{labels[language].members || "Members"}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>
          {labels[language].add || "Add"}
        </Text>
      </TouchableOpacity>
      {members.length > 0 ? (
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>
              {labels[language].name || "Name"}
            </Text>
            <Text style={styles.tableHeaderText}>
              {labels[language].email || "Email"}
            </Text>
            <Text style={styles.tableHeaderText}>
              {labels[language].role || "Role"}
            </Text>
          </View>
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {labels[language].noMembers || "No members available"}
          </Text>
        </View>
      )}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {labels[language].addMember || "Add Member"}
            </Text>
            <TextInput
              style={styles.input}
              value={newMember.username}
              onChangeText={(text) =>
                setNewMember({ ...newMember, username: text })
              }
              placeholder={labels[language].enterName || "Enter name"}
            />
            <TextInput
              style={styles.input}
              value={newMember.email}
              onChangeText={(text) =>
                setNewMember({ ...newMember, email: text })
              }
              placeholder={labels[language].enterEmail || "Enter email"}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={newMember.role}
              onChangeText={(text) =>
                setNewMember({ ...newMember, role: text })
              }
              placeholder={labels[language].enterRole || "Enter role"}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].cancel || "Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddMember}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].save || "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Member;
