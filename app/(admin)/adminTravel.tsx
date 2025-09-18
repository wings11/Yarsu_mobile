import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/travel.styles";
import { useTravel } from "@/hooks/useTravel";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { COLORS } from "@/constants/colors";

// Define the TravelPost type
type TravelPostType = {
  id: number;
  name: string;
  place: string;
  highlights: string[];
  images: string[];
  admin_rating: number;
  created_at: string;
  notes?: string; // Changed from 'note' to 'notes' to match backend
};

// Define type for edited values
type EditedTravelPostType = Partial<{
  name: string;
  place: string;
  highlights: string;
  images: string;
  admin_rating: string | number;
  notes: string; // Changed from 'note' to 'notes'
}>;

const AdminTravel = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const {
    travelPosts,
    loadTravelPosts,
    fetchTravelPosts,
    updateTravelPost,
    deleteTravelPost,
  } = useTravel();
  const [posts, setPosts] = useState<TravelPostType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedTravelPostType;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );
  const [currentIndices, setCurrentIndices] = useState<{
    [key: number]: number;
  }>({});
  const [isNoteExpanded, setIsNoteExpanded] = useState<{
    [key: number]: boolean;
  }>({});
  const [numColumns, setNumColumns] = useState(3);
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: number]: ICarouselInstance | null }>({});

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 3 : 1);
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (isInitialMount.current) {
      console.log("AdminTravel: Initial fetch of travel posts");
      loadTravelPosts();
      isInitialMount.current = false;
    }
  }, [loadTravelPosts]);

  // Update posts when travelPosts changes
  useEffect(() => {
    console.log("AdminTravel: Updating posts with travelPosts", travelPosts);
    setPosts(travelPosts);
    const initialIndices = travelPosts.reduce((acc, post) => {
      acc[post.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
    const initialNoteExpanded = travelPosts.reduce((acc, post) => {
      acc[post.id] = false;
      return acc;
    }, {} as { [key: number]: boolean });
    setIsNoteExpanded(initialNoteExpanded);
  }, [travelPosts]);

  // Auto-slide images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (!editMode[post.id] && carouselRefs.current[post.id]) {
            const totalImages = post.images.length || 1;
            const newIndex = (prev[post.id] + 1) % totalImages;
            newIndices[post.id] = newIndex;
            carouselRefs.current[post.id]?.scrollTo({
              index: newIndex,
              animated: true,
            });
          }
        });
        return newIndices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [posts, editMode]);

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number) => {
    const updatedPost = editedValues[id] || {};
    const currentPost = posts.find((post) => post.id === id);
    if (!currentPost) {
      Alert.alert("Error", "Post not found");
      return;
    }

    const convertedPost: TravelPostType = { ...currentPost };

    // Convert string inputs to appropriate types
    if (updatedPost.name) {
      convertedPost.name = updatedPost.name;
    }
    if (updatedPost.place) {
      convertedPost.place = updatedPost.place;
    }
    if (updatedPost.highlights !== undefined) {
      convertedPost.highlights = updatedPost.highlights
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }
    if (updatedPost.images !== undefined) {
      convertedPost.images = updatedPost.images
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }
    if (updatedPost.admin_rating !== undefined) {
      const rating = Number(updatedPost.admin_rating);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        convertedPost.admin_rating = rating;
      } else {
        Alert.alert("Error", "Rating must be a number between 0 and 5");
        return;
      }
    }
    if (updatedPost.notes !== undefined) {
      convertedPost.notes = updatedPost.notes || undefined; // Changed from 'note' to 'notes'
    }

    if (Object.keys(updatedPost).length > 0) {
      try {
        const updated = await updateTravelPost(id, convertedPost);
        setPosts((prev) =>
          prev.map((post) => (post.id === id ? updated : post))
        );
        setEditMode({ ...editMode, [id]: false });
        setIsNoteExpanded({ ...isNoteExpanded, [id]: false });
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
        Alert.alert(
          "Saved",
          labels[language].saved || "Changes have been saved!"
        );
      } catch (error) {
        console.error("AdminTravel: Error updating travel post", error);
        Alert.alert("Error", "Failed to update travel post");
      }
    } else {
      setEditMode({ ...editMode, [id]: false });
      setIsNoteExpanded({ ...isNoteExpanded, [id]: false });
    }
  };

  const handleConfirmDelete = (id: number) => {
    deleteTravelPost(id).catch((error) => {
      console.error("AdminTravel: Error deleting travel post", error);
      Alert.alert("Error", "Failed to delete travel post");
    });
    setDeleteModalVisible(null);
    setPosts(posts.filter((post) => post.id !== id));
    setIsNoteExpanded((prev) => {
      const newExpanded = { ...prev };
      delete newExpanded[id];
      return newExpanded;
    });
    Alert.alert(
      "Deleted",
      labels[language].deleted || "Travel post has been deleted!"
    );
  };

  const renderStar = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Text key={i} style={styles.star}>
            ★
          </Text>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Text key={i} style={styles.star}>
            ⯪
          </Text>
        );
      } else {
        stars.push(
          <Text key={i} style={styles.star}>
            ☆
          </Text>
        );
      }
    }
    return stars;
  };

  const handlePrev = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages = posts.find((p) => p.id === id)?.images.length || 1;
      const newIndex = (currentIndex - 1 + totalImages) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages = posts.find((p) => p.id === id)?.images.length || 1;
      const newIndex = (currentIndex + 1) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: TravelPostType }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {editMode[item.id] ? (
          <TextInput
            style={styles.input}
            value={
              editedValues[item.id]?.images || item.images.join(", ") || ""
            }
            onChangeText={(text) => handleEdit(item.id, "images", text)}
            placeholder="Enter image URLs (comma-separated)"
          />
        ) : (
          <>
            <View style={styles.imageBackground}>
              <Carousel
                ref={(ref) => {
                  if (ref) {
                    carouselRefs.current[item.id] = ref;
                  }
                }}
                width={340}
                height={200}
                data={
                  item.images.length > 0
                    ? item.images
                    : ["https://picsum.photos/340/200"]
                }
                scrollAnimationDuration={300}
                defaultIndex={currentIndices[item.id] || 0}
                onSnapToItem={(index) =>
                  setCurrentIndices((prev) => ({ ...prev, [item.id]: index }))
                }
                renderItem={({ item: image }) => (
                  <Image
                    source={{ uri: image }}
                    style={styles.innerImage}
                    onError={(error) =>
                      console.error(
                        "AdminTravel: Image load error for item",
                        item.id,
                        error.nativeEvent
                      )
                    }
                  />
                )}
              />
            </View>
            {item.images.length > 1 && (
              <View style={styles.sliderControls}>
                <TouchableOpacity onPress={() => handlePrev(item.id)}>
                  <Text style={styles.arrow}>{"<"}</Text>
                </TouchableOpacity>
                <FlatList
                  horizontal
                  contentContainerStyle={styles.indicatorContainer}
                  data={item.images}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ index }) => (
                    <View
                      style={[
                        styles.indicator,
                        currentIndices[item.id] === index &&
                          styles.activeIndicator,
                      ]}
                    />
                  )}
                  showsHorizontalScrollIndicator={false}
                />
                <TouchableOpacity onPress={() => handleNext(item.id)}>
                  <Text style={styles.arrow}>{">"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.name || item.name || ""}
              onChangeText={(text) => handleEdit(item.id, "name", text)}
              placeholder="Enter name"
            />
          ) : (
            <Text style={styles.value}>{item.name || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].place || "Place"}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.place || item.place || ""}
              onChangeText={(text) => handleEdit(item.id, "place", text)}
              placeholder="Enter place"
            />
          ) : (
            <Text style={styles.value}>{item.place || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].highlights || "Highlights"}:
          </Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.highlights ||
                item.highlights.join(", ") ||
                ""
              }
              onChangeText={(text) => handleEdit(item.id, "highlights", text)}
              placeholder="Enter highlights (comma-separated)"
            />
          ) : (
            <Text style={styles.value}>
              {item.highlights.length > 0 ? item.highlights.join(", ") : "N/A"}
            </Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].adminRating || "Rating"}:
          </Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.admin_rating !== undefined
                  ? String(editedValues[item.id].admin_rating)
                  : String(item.admin_rating || 0)
              }
              onChangeText={(text) => handleEdit(item.id, "admin_rating", text)}
              placeholder="Enter rating (0-5)"
              keyboardType="numeric"
            />
          ) : (
            <View style={{ flexDirection: "row", width: "55%" }}>
              {renderStar(item.admin_rating || 0)}
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].notes || "Notes"}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={editedValues[item.id]?.notes || item.notes || ""}
              onChangeText={(text) => handleEdit(item.id, "notes", text)}
              placeholder="Enter notes"
              multiline
              numberOfLines={3}
            />
          ) : (
            <TouchableOpacity
              style={styles.noteTextBox}
              onPress={() =>
                setIsNoteExpanded((prev) => ({
                  ...prev,
                  [item.id]: !prev[item.id],
                }))
              }
            >
              <View
                style={[
                  styles.noteTextContainer,
                  !isNoteExpanded[item.id] && styles.collapsedNoteText,
                ]}
              >
                <Text style={styles.value}>
                  {item.notes || "No additional notes available"}
                </Text>
              </View>
              <Ionicons
                name={isNoteExpanded[item.id] ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.black}
                style={styles.dropdownArrow}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {editMode[item.id] ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSave(item.id)}
            >
              <Text style={styles.buttonText}>
                {labels[language].save || "Save"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setEditMode({ ...editMode, [item.id]: true });
                setIsNoteExpanded({ ...isNoteExpanded, [item.id]: false });
              }}
            >
              <Text style={styles.buttonText}>
                {labels[language].edit || "Edit"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDeleteModalVisible(item.id)}
          >
            <Text style={styles.buttonText}>
              {labels[language].delete || "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={deleteModalVisible === item.id}
        onRequestClose={() => setDeleteModalVisible(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {labels[language].deleteConfirm ||
                "Are you sure you want to delete this travel post?"}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(null)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].cancel || "Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleConfirmDelete(item.id)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].delete || "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          key={`flatlist-${numColumns}`}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          ListEmptyComponent={
            <Text style={styles.title}>
              {labels[language].noPosts || "No travel posts available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminTravel;
