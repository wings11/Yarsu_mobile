import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "@/libs/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { styles } from "@/assets/styles/adminstyles/forgetpassword.styles";
import { COLORS } from "@/constants/colors";

const ForgetPassword = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypeNewPassword, setRetypeNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const handleSavePassword = async () => {
    if (newPassword.length < 8 || retypeNewPassword.length < 8) {
      Alert.alert(
        "Error",
        labels[language].passwordLengthError ||
          "Passwords must be at least 8 characters long."
      );
      return;
    }
    if (newPassword !== retypeNewPassword) {
      Alert.alert(
        "Error",
        labels[language].passwordMismatch || "New passwords do not match."
      );
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Error", "You must be logged in to change your password.");
        router.push("/login");
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        console.error("Error updating password:", error);
        Alert.alert(
          "Error",
          labels[language].passwordUpdateError ||
            "Failed to update password. Please try again."
        );
      } else {
        Alert.alert(
          "Success",
          labels[language].passwordUpdated || "Password updated successfully!"
        );
        setOldPassword("");
        setNewPassword("");
        setRetypeNewPassword("");
        router.push("/(admin)/dashboard");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Alert.alert(
        "Error",
        labels[language].passwordUpdateError ||
          "Failed to update password. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {labels[language].changePassword || "Change Password"}
        </Text>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].oldPassword || "Old Password"}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder={
                labels[language].enterPassword || "Enter at least 8 characters"
              }
              secureTextEntry={!showOldPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowOldPassword(!showOldPassword)}
            >
              <Ionicons
                name={showOldPassword ? "eye-off" : "eye"}
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].newPassword || "New Password"}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={
                labels[language].enterPassword || "Enter at least 8 characters"
              }
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off" : "eye"}
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].retypeNewPassword || "Re-type New Password"}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={retypeNewPassword}
              onChangeText={setRetypeNewPassword}
              placeholder={
                labels[language].enterPassword || "Enter at least 8 characters"
              }
              secureTextEntry={!showRetypePassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowRetypePassword(!showRetypePassword)}
            >
              <Ionicons
                name={showRetypePassword ? "eye-off" : "eye"}
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePassword}
        >
          <Text style={styles.saveButtonText}>
            {labels[language].savePassword || "Save Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgetPassword;
