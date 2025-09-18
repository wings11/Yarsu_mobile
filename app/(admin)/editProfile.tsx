import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  BackHandler,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { styles } from "@/assets/styles/adminstyles/editProfile.styles";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/context/UserContext";

const EditProfile = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { profile, updateProfile, uploadImage } = useUser();
  const [isEditing, setIsEditing] = useState(false);

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
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      // Persist to AsyncStorage via updateProfile
      await updateProfile({}); // Trigger AsyncStorage save
      Alert.alert("Saved", "Profile has been updated successfully!");
    } catch (error: any) {
      console.error("EditProfile - Error saving profile:", error.message);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const handleChange = (field: string, value: string) => {
    updateProfile({ [field]: value });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const file = {
        uri: result.assets[0].uri,
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        Alert.alert("Success", "Image updated successfully!");
      } else {
        Alert.alert("Error", "Failed to upload image.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickImage}
            {...(Platform.OS !== "web"
              ? { onStartShouldSetResponder: () => true }
              : {})}
          >
            <Image
              source={
                profile.imageUrl
                  ? { uri: profile.imageUrl }
                  : require("@/assets/images/camera.png")
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Enter name"
              />
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{profile.name || "Not set"}</Text>
              </View>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.phoneNumber || ""}
                onChangeText={(text) => handleChange("phoneNumber", text)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>
                  {profile.phoneNumber || "Not set"}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Address</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.address || ""}
                onChangeText={(text) => handleChange("address", text)}
                placeholder="Enter address"
              />
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{profile.address || "Not set"}</Text>
              </View>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.email || "Not set"}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={isEditing ? handleSave : handleEdit}
            {...(Platform.OS !== "web"
              ? { onStartShouldSetResponder: () => true }
              : {})}
          >
            <Text style={styles.actionText}>{isEditing ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
