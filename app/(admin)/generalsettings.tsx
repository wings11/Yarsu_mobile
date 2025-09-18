import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { useLinks } from "@/hooks/useLinks";
import { useHighlights } from "@/hooks/useHighlights";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/libs/supabase";
import { styles } from "@/assets/styles/adminstyles/generalSettings.styles";

const GeneralSettings = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { links, fetchLinks, updateLink, loadLinks } = useLinks();
  const {
    highlights,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    loadHighlights,
    isLoading,
  } = useHighlights();
  const [isCreating, setIsCreating] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [bannerImages, setBannerImages] = useState([null, null, null, null]);
  const [linkInputs, setLinkInputs] = useState({
    telegram: "",
    youtube: "",
    facebook: "",
    tiktok: "",
  });
  const [editingField, setEditingField] = useState(null);

  // Load highlights and links on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadHighlights(), loadLinks()]);
      } catch (error) {
        console.error("GeneralSettings - Error loading data:", error.message);
        Alert.alert("Error", `Failed to load data: ${error.message}`);
        setBannerImages([null, null, null, null]);
      }
    };
    loadData();
  }, [loadHighlights, loadLinks]);

  // Sync bannerImages with highlights
  useEffect(() => {
    if (highlights && highlights.length > 0) {
      const newBannerImages = highlights.map((highlight) =>
        highlight?.image ? { uri: `${highlight.image}?t=${Date.now()}` } : null
      );
      while (newBannerImages.length < 4) {
        newBannerImages.push(null);
      }
      setBannerImages(newBannerImages.slice(0, 4));
    } else {
      setBannerImages([null, null, null, null]);
    }
  }, [highlights]);

  // Update linkInputs when links change
  useEffect(() => {
    setLinkInputs({
      telegram:
        links.find((l) => l.platform.toLowerCase() === "telegram")?.url || "",
      youtube:
        links.find((l) => l.platform.toLowerCase() === "youtube")?.url || "",
      facebook:
        links.find((l) => l.platform.toLowerCase() === "facebook")?.url || "",
      tiktok:
        links.find((l) => l.platform.toLowerCase() === "tiktok")?.url || "",
    });
  }, [links]);

  const handleEditField = (field) => setEditingField(field);

  const handleSaveField = async (field, value) => {
    try {
      const platform = field.charAt(0).toUpperCase() + field.slice(1);
      const existingLink = links.find(
        (link) => link.platform.toLowerCase() === field
      );

      if (existingLink) {
        await updateLink(existingLink.id, { platform, url: value });
        setEditingField(null);
        Alert.alert("Success", `${platform} link saved!`);
      } else {
        Alert.alert(
          "Error",
          `Cannot create new ${field} link. Only existing links can be edited.`
        );
      }
    } catch (error) {
      console.error(`Error saving ${field} link:`, error.message);
      Alert.alert("Error", `Failed to save ${field} link: ${error.message}`);
    }
  };

  const handleChange = (field, value) => {
    setLinkInputs((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingHighlight(null);
  };

  const handleEditHighlight = (highlight, index) => {
    setEditingHighlight({ ...highlight, index });
    setIsCreating(true);
  };

  const handleDeleteHighlight = async (highlightId) => {
    try {
      await deleteHighlight(highlightId);
      Alert.alert("Success", "Highlight deleted successfully!");
      await loadHighlights();
    } catch (error) {
      console.error("Delete highlight error:", error.message);
      Alert.alert("Error", `Failed to delete highlight: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.header}>Highlights Management</Text>
            <Text style={styles.subHeader}>
              Manage homepage slideshow images
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⚡ Superadmin Only</Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsCreating(true)}
            >
              <Ionicons name="add" size={16} color={COLORS.white} />
              <Text style={styles.actionText}>New Highlight</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create/Edit Highlight Form */}
        {(isCreating || editingHighlight) && (
          <HighlightForm
            highlight={editingHighlight}
            onSave={async (imageUrl, index) => {
              try {
                if (editingHighlight) {
                  await updateHighlight(editingHighlight.id, {
                    image: imageUrl,
                  });
                  Alert.alert("Success", "Highlight updated successfully!");
                } else {
                  await createHighlight({ image: imageUrl });
                  Alert.alert("Success", "Highlight created successfully!");
                }
                resetForm();
                await loadHighlights();
              } catch (error) {
                console.error("Error saving highlight:", error.message);
                Alert.alert(
                  "Error",
                  `Failed to save highlight: ${error.message}`
                );
              }
            }}
            onCancel={resetForm}
            isLoading={false}
          />
        )}

        {/* Highlights Grid */}
        <View style={styles.gridContainer}>
          {bannerImages.map((image, index) => {
            const highlight = highlights[index];
            return (
              <View key={index} style={styles.gridItem}>
                {image?.uri ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: image.uri,
                        headers: { "Cache-Control": "no-cache" },
                      }}
                      style={styles.image}
                      resizeMode="cover"
                      onError={(error) => {
                        console.error(
                          `Image load error for highlight ${index}:`,
                          error.nativeEvent.error
                        );
                        Alert.alert(
                          "Image Load Error",
                          `Failed to load highlight ${index + 1}.`
                        );
                        const newImages = [...bannerImages];
                        newImages[index] = null;
                        setBannerImages(newImages);
                      }}
                    />
                    <View style={styles.badgeOverlay}>
                      <Ionicons
                        name="star"
                        size={12}
                        color={COLORS.white}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.badgeText}>Highlight</Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.image,
                      {
                        backgroundColor: COLORS.gray,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Text style={{ color: COLORS.white }}>No Image</Text>
                  </View>
                )}
                <View style={styles.gridItemFooter}>
                  <Text style={styles.dateText}>
                    {highlight?.created_at
                      ? new Date(highlight.created_at).toLocaleDateString()
                      : "-"}
                  </Text>
                  {image?.uri && (
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEditHighlight(highlight, index)}
                      >
                        <Ionicons name="pencil" size={16} color={COLORS.gray} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() =>
                          highlight && handleDeleteHighlight(highlight.id)
                        }
                      >
                        <Ionicons name="trash" size={16} color={COLORS.red} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {image?.uri && (
                  <Text style={styles.urlText} numberOfLines={1}>
                    {image.uri}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {(!highlights || highlights.length === 0) && (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No highlights yet</Text>
            <Text style={styles.emptyText}>
              Create your first highlight for the homepage slideshow.
            </Text>
          </View>
        )}
      </View>

      {/* Links Section */}
      <View style={styles.card}>
        <Text style={styles.header}>Links</Text>
        {["telegram", "youtube", "facebook", "tiktok"].map((field) => (
          <View key={field} style={styles.fieldRow}>
            <Text style={styles.label}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </Text>
            {editingField === field ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={linkInputs[field] || ""}
                  onChangeText={(text) => handleChange(field, text)}
                  placeholder={`Enter ${field} link`}
                />
                <TouchableOpacity
                  style={[styles.actionButton, { marginLeft: 10 }]}
                  onPress={() =>
                    handleSaveField(field, linkInputs[field] || "")
                  }
                >
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>
                    {linkInputs[field] || "Not set"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, { marginLeft: 10 }]}
                  onPress={() => handleEditField(field)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Highlight Form Component
const HighlightForm = ({ highlight, onSave, onCancel, isLoading }) => {
  const [imageUrl, setImageUrl] = useState(highlight?.image || "");

  const handleSubmit = () => {
    if (!imageUrl.trim()) {
      Alert.alert("Error", "Image URL is required.");
      return;
    }
    try {
      new URL(imageUrl);
      onSave(imageUrl.trim(), highlight?.index || 0);
    } catch {
      Alert.alert("Error", "Please enter a valid image URL.");
    }
  };

  const handleFileUpload = async () => {
    try {
      console.log("Requesting media library permissions");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow access to your photos.");
        return;
      }

      console.log("Launching image picker");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets) {
        console.log("Image picker canceled");
        return;
      }

      const uri = result.assets[0].uri;
      console.log("Selected image URI:", uri);

      // Read file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log("File info:", fileInfo);
      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error("Selected file is empty or does not exist.");
      }

      // Read as base64
      console.log("Reading image as base64");
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Base64 sample:", base64.substring(0, 100));
      console.log("Base64 data length:", base64.length);
      if (!base64 || base64.length < 1000) {
        throw new Error("Base64 data is empty or too small for an image.");
      }

      // Convert to ArrayBuffer
      console.log("Converting base64 to ArrayBuffer");
      let arrayBuffer;
      try {
        arrayBuffer = decode(base64);
      } catch (error) {
        console.error("Base64 decode error:", error.message);
        throw new Error("Failed to decode base64 to ArrayBuffer.");
      }

      console.log("ArrayBuffer byte length:", arrayBuffer.byteLength);
      if (arrayBuffer.byteLength < 1000) {
        throw new Error("ArrayBuffer is empty or too small for an image.");
      }

      const fileExtension = uri.split(".").pop()?.toLowerCase() || "jpg";
      const contentType = fileExtension === "png" ? "image/png" : "image/jpeg";
      const fileName = `highlight-${Date.now()}-${
        highlight?.index || 0
      }.${fileExtension}`;

      // Remove existing image if updating
      if (highlight?.image) {
        const oldImagePath = highlight.image.split("/").pop().split("?")[0];
        console.log("Removing old image:", oldImagePath);
        if (oldImagePath) {
          const { error: removeError } = await supabase.storage
            .from("images")
            .remove([oldImagePath]);
          if (removeError) {
            console.error("Error removing old image:", removeError.message);
            Alert.alert(
              "Error",
              `Failed to remove old image: ${removeError.message}`
            );
            return;
          }
        }
      }

      // Upload to Supabase
      console.log("Uploading image to Supabase images bucket:", fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("images")
        .upload(fileName, arrayBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
        Alert.alert("Error", `Failed to upload image: ${uploadError.message}`);
        return;
      }
      console.log("Upload response:", uploadData);

      // Get public URL
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      const uploadedUrl = data.publicUrl;
      console.log("Image uploaded, public URL:", uploadedUrl);

      // Verify URL
      try {
        console.log("Verifying public URL:", uploadedUrl);
        const urlCheck = await fetch(uploadedUrl, { method: "HEAD" });
        if (!urlCheck.ok) {
          throw new Error(
            `Public URL is not accessible: ${urlCheck.status} ${urlCheck.statusText}`
          );
        }
      } catch (error) {
        console.error("Error verifying public URL:", error.message);
        Alert.alert(
          "Error",
          `Uploaded image URL is not accessible: ${error.message}`
        );
        return;
      }

      setImageUrl(uploadedUrl);
      onSave(uploadedUrl, highlight?.index || 0);
    } catch (error) {
      console.error("Error in handleFileUpload:", error.message);
      Alert.alert("Error", `Failed to upload image: ${error.message}`);
    }
  };

  return (
    <View style={[styles.card, { marginTop: 16 }]}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <Ionicons
          name="star"
          size={20}
          color={COLORS.yellow}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.formHeader}>
          {highlight ? "Edit Highlight" : "Create New Highlight"}
        </Text>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>Image URL *</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://example.com/image.jpg"
        />
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>Or Upload Image File</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleFileUpload}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={16}
            color={COLORS.yellow}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.uploadButtonText}>Choose Image</Text>
        </TouchableOpacity>
      </View>
      {imageUrl && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Preview:</Text>
          <Image
            source={{ uri: imageUrl, headers: { "Cache-Control": "no-cache" } }}
            style={styles.previewImage}
            resizeMode="cover"
            onError={(error) => {
              console.error("Preview image error:", error.nativeEvent.error);
              Alert.alert("Error", "Failed to load preview image.");
            }}
          />
        </View>
      )}
      <View style={{ flexDirection: "row", marginTop: 16 }}>
        <TouchableOpacity
          style={[styles.actionButton, { marginRight: 12 }]}
          onPress={handleSubmit}
          disabled={isLoading || !imageUrl.trim()}
        >
          <Text style={styles.actionText}>
            {isLoading
              ? "Saving..."
              : highlight
              ? "Update Highlight"
              : "Create Highlight"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.gray }]}
          onPress={onCancel}
        >
          <Text style={styles.actionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GeneralSettings;
