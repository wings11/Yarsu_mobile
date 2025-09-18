import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/restaurant.styles";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

// Define the Restaurant type with optional fields to match potential API data
type RestaurantType = {
  id: number;
  name: string;
  address?: string; // Changed to optional to match 'location' in sample
  price?: number;
  nearby_famous_places?: string[];
  cuisine_types?: string[];
  images?: string[];
  notes?: string;
  admin_rating?: number;
  created_at?: string;
  location?: string; // Added to match sample data
  popular_picks?: string[]; // Added to match sample data
};

// Define type for edited values
type EditedRestaurantType = Partial<{
  name: string;
  address: string;
  price: string | number;
  nearby_famous_places: string;
  cuisine_types: string;
  images: string;
  notes: string;
  admin_rating: string | number;
  location: string; // Added to match sample data
  popular_picks: string; // Added to match sample data
}>;

const AdminRestaurants = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { restaurants, loadRestaurants, updateRestaurant, deleteRestaurant } =
    useRestaurants();
  const [posts, setPosts] = useState<RestaurantType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedRestaurantType;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );
  const [currentIndices, setCurrentIndices] = useState<{
    [key: number]: number;
  }>({});
  const [numColumns, setNumColumns] = useState(3);
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: number]: ICarouselInstance | null }>({});

  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 3 : 1);
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      console.log("AdminRestaurants: Initial fetch of restaurants");
      loadRestaurants();
      isInitialMount.current = false;
    }
  }, [loadRestaurants]);

  useEffect(() => {
    console.log(
      "AdminRestaurants: Updating posts with restaurants",
      restaurants
    );
    // Normalize data to ensure required fields are present
    const normalizedRestaurants = (restaurants || []).map((restaurant) => ({
      ...restaurant,
      images: restaurant.images || [],
      nearby_famous_places: restaurant.nearby_famous_places || [],
      cuisine_types: restaurant.cuisine_types || [],
      address: restaurant.address || restaurant.location || "",
      popular_picks: restaurant.popular_picks || [],
    }));
    setPosts(normalizedRestaurants);
    const initialIndices = normalizedRestaurants.reduce((acc, restaurant) => {
      acc[restaurant.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
  }, [restaurants]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (!editMode[post.id] && carouselRefs.current[post.id]) {
            const totalImages = post.images?.length || 1;
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

  const handleSave = (id: number) => {
    const updatedRestaurant = editedValues[id] || {};
    const convertedRestaurant: Partial<RestaurantType> = {};

    if (updatedRestaurant.name)
      convertedRestaurant.name = updatedRestaurant.name;
    if (updatedRestaurant.address)
      convertedRestaurant.address = updatedRestaurant.address;
    if (updatedRestaurant.price !== undefined) {
      const price = Number(updatedRestaurant.price);
      if (!isNaN(price)) convertedRestaurant.price = price;
    }
    if (updatedRestaurant.nearby_famous_places !== undefined) {
      convertedRestaurant.nearby_famous_places =
        updatedRestaurant.nearby_famous_places
          .split(",")
          .map((item) => item.trim());
    }
    if (updatedRestaurant.cuisine_types !== undefined) {
      convertedRestaurant.cuisine_types = updatedRestaurant.cuisine_types
        .split(",")
        .map((item) => item.trim());
    }
    if (updatedRestaurant.images !== undefined) {
      convertedRestaurant.images = updatedRestaurant.images
        .split(",")
        .map((item) => item.trim());
    }
    if (updatedRestaurant.notes)
      convertedRestaurant.notes = updatedRestaurant.notes;
    if (updatedRestaurant.admin_rating !== undefined) {
      const rating = Number(updatedRestaurant.admin_rating);
      if (!isNaN(rating)) convertedRestaurant.admin_rating = rating;
    }
    if (updatedRestaurant.location)
      convertedRestaurant.location = updatedRestaurant.location;
    if (updatedRestaurant.popular_picks !== undefined) {
      convertedRestaurant.popular_picks = updatedRestaurant.popular_picks
        .split(",")
        .map((item) => item.trim());
    }

    if (Object.keys(convertedRestaurant).length > 0) {
      updateRestaurant(id, convertedRestaurant).catch((error) => {
        Alert.alert("Error", "Failed to update restaurant");
      });
      setEditMode({ ...editMode, [id]: false });
      setEditedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
      Alert.alert(
        "Saved",
        labels[language].saved || "Changes have been saved!"
      );
    } else {
      setEditMode({ ...editMode, [id]: false });
    }
  };

  const handleConfirmDelete = (id: number) => {
    deleteRestaurant(id).catch((error) => {
      Alert.alert("Error", "Failed to delete restaurant");
    });
    setDeleteModalVisible(null);
    setPosts(posts.filter((post) => post.id !== id));
    Alert.alert(
      "Deleted",
      labels[language].deleted || "Restaurant has been deleted!"
    );
  };

  const renderStar = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars)
        stars.push(
          <Text key={i} style={styles.star}>
            ★
          </Text>
        );
      else if (i === fullStars + 1 && hasHalfStar)
        stars.push(
          <Text key={i} style={styles.star}>
            ⯪
          </Text>
        );
      else
        stars.push(
          <Text key={i} style={styles.star}>
            ☆
          </Text>
        );
    }
    return stars;
  };

  const handlePrev = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages = posts.find((p) => p.id === id)?.images?.length || 1;
      const newIndex = (currentIndex - 1 + totalImages) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages = posts.find((p) => p.id === id)?.images?.length || 1;
      const newIndex = (currentIndex + 1) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: RestaurantType }) => {
    if (!item) return null; // Safeguard against undefined item
    const images = item.images || []; // Fallback to empty array if images is undefined
    const isEditing = editMode[item.id] || false;
    const currentValues = editedValues[item.id] || {};

    return (
      <View style={styles.card}>
        <View style={styles.detailsContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.name || item.name || ""}
                onChangeText={(text) => handleEdit(item.id, "name", text)}
                placeholder="Enter name"
              />
            ) : (
              <Text style={styles.value}>{item.name || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].address || "Address"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={
                  currentValues.address || item.address || item.location || ""
                }
                onChangeText={(text) => handleEdit(item.id, "address", text)}
                placeholder="Enter address"
              />
            ) : (
              <Text style={styles.value}>
                {item.address || item.location || "N/A"}
              </Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].popular || "Popular Picks"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={
                  currentValues.popular_picks ||
                  (item.popular_picks || []).join(", ") ||
                  ""
                }
                onChangeText={(text) =>
                  handleEdit(item.id, "popular_picks", text)
                }
                placeholder="Enter popular picks (comma-separated)"
              />
            ) : (
              <View style={{ flexDirection: "column", width: "55%" }}>
                {(item.popular_picks || []).length > 0 ? (
                  (item.popular_picks || []).map((pick, index) => (
                    <Text key={index} style={styles.value}>
                      - {pick}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.value}>N/A</Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].notes || "Notes"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.notes || item.notes || ""}
                onChangeText={(text) => handleEdit(item.id, "notes", text)}
                placeholder="Enter notes"
              />
            ) : (
              <Text style={styles.value}>{item.notes || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].rating || "Rating"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={
                  currentValues.admin_rating !== undefined
                    ? String(currentValues.admin_rating)
                    : String(item.admin_rating || 0)
                }
                onChangeText={(text) =>
                  handleEdit(item.id, "admin_rating", text)
                }
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
            ) : (
              <View style={{ flexDirection: "row", width: "55%" }}>
                {renderStar(item.admin_rating || 0)}
              </View>
            )}
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.imageContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={
                  currentValues.images ||
                  (item.images ? item.images.join(", ") : "")
                }
                onChangeText={(text) => handleEdit(item.id, "images", text)}
                placeholder="Enter image URLs (comma-separated)"
              />
            ) : (
              <>
                <View style={styles.imageBackground}>
                  <Carousel
                    ref={(ref) => {
                      if (ref) carouselRefs.current[item.id] = ref;
                    }}
                    width={200}
                    height={150}
                    data={
                      images.length > 0
                        ? images
                        : ["https://picsum.photos/340/200"]
                    }
                    scrollAnimationDuration={300}
                    defaultIndex={currentIndices[item.id] || 0}
                    onSnapToItem={(index) =>
                      setCurrentIndices((prev) => ({
                        ...prev,
                        [item.id]: index,
                      }))
                    }
                    renderItem={({ item: image }) => (
                      <Image
                        source={{ uri: image }}
                        style={styles.innerImage}
                        onError={(error) =>
                          console.error(
                            "AdminRestaurants: Image load error for item",
                            item.id,
                            error.nativeEvent
                          )
                        }
                      />
                    )}
                  />
                </View>
                {images.length === 1 && <View style={styles.noImages}></View>}
                {(images.length > 1 ||
                  (images.length === 0 &&
                    ["https://picsum.photos/340/200"].length > 1)) && (
                  <View style={styles.sliderControls}>
                    <TouchableOpacity onPress={() => handlePrev(item.id)}>
                      <Text style={styles.arrow}>{"<"}</Text>
                    </TouchableOpacity>
                    <FlatList
                      horizontal
                      contentContainerStyle={styles.indicatorContainer}
                      data={
                        images.length > 0
                          ? images
                          : ["https://picsum.photos/340/200"]
                      }
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
          <View style={styles.buttonContainer}>
            {isEditing ? (
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
                onPress={() => setEditMode({ ...editMode, [item.id]: true })}
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
                  "Are you sure you want to delete this restaurant?"}
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
  };

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
              {labels[language].noRestaurants || "No restaurants available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminRestaurants;
