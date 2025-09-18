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
import { styles } from "@/assets/styles/adminstyles/hotel.styles";
import { useHotels } from "@/hooks/useHotels";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/libs/supabase";

// Define the Hotel type
type HotelType = {
  id: number;
  name: string;
  address: string;
  price: number;
  nearby_famous_places: string[];
  breakfast: boolean;
  free_wifi: boolean;
  swimming_pool: boolean;
  images: string[];
  notes?: string;
  admin_rating: number;
  created_at: string;
};

// Define type for edited values
type EditedHotelType = Partial<{
  name: string;
  address: string;
  price: string | number;
  nearby_famous_places: string;
  breakfast: string | boolean;
  free_wifi: string | boolean;
  swimming_pool: string | boolean;
  images: string[]; // Changed to array of URIs
  notes: string;
  admin_rating: string | number;
}>;

const AdminHotel = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { hotels, loadHotels, updateHotel, deleteHotel } = useHotels();
  const [posts, setPosts] = useState<HotelType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedHotelType;
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

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant permission to access the photo library to add images."
        );
      }
    })();
  }, []);

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
      console.log("AdminHotel: Initial fetch of hotels");
      loadHotels();
      isInitialMount.current = false;
    }
  }, [loadHotels]);

  // Update posts when hotels changes
  useEffect(() => {
    console.log("AdminHotel: Updating posts with hotels", hotels);
    setPosts(hotels);
    const initialIndices = hotels.reduce((acc, hotel) => {
      acc[hotel.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
  }, [hotels]);

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

  const pickImages = async (id: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setEditedValues((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          images: [...(prev[id]?.images || []), ...newImages],
        },
      }));
    }
  };

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number) => {
    const updatedHotel = editedValues[id] || {};
    const convertedHotel: Partial<HotelType> = {};

    if (updatedHotel.name) convertedHotel.name = updatedHotel.name;
    if (updatedHotel.address) convertedHotel.address = updatedHotel.address;
    if (updatedHotel.price !== undefined) {
      const price = Number(updatedHotel.price);
      if (!isNaN(price)) convertedHotel.price = price;
    }
    if (updatedHotel.nearby_famous_places !== undefined) {
      convertedHotel.nearby_famous_places = updatedHotel.nearby_famous_places
        .split(",")
        .map((item) => item.trim());
    }
    if (updatedHotel.breakfast !== undefined) {
      convertedHotel.breakfast = updatedHotel.breakfast === "Yes";
    }
    if (updatedHotel.free_wifi !== undefined) {
      convertedHotel.free_wifi = updatedHotel.free_wifi === "Yes";
    }
    if (updatedHotel.swimming_pool !== undefined) {
      convertedHotel.swimming_pool = updatedHotel.swimming_pool === "Yes";
    }
    if (updatedHotel.notes) convertedHotel.notes = updatedHotel.notes;
    if (updatedHotel.admin_rating !== undefined) {
      const rating = Number(updatedHotel.admin_rating);
      if (!isNaN(rating)) convertedHotel.admin_rating = rating;
    }
    if (updatedHotel.images && updatedHotel.images.length > 0) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < updatedHotel.images.length; i++) {
        const uri = updatedHotel.images[i];
        const fileName = `hotel-${id}-${Date.now()}-${i}.jpg`;
        const response = await fetch(uri);
        const blob = await response.blob();
        const { error } = await supabase.storage
          .from("hotel-images")
          .upload(fileName, blob, { contentType: "image/jpeg" });
        if (error) {
          console.error("Image upload error:", error);
          Alert.alert("Error", "Failed to upload image.");
          return;
        }
        const { data } = supabase.storage
          .from("hotel-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
      convertedHotel.images = uploadedUrls;
    }

    if (Object.keys(convertedHotel).length > 0) {
      try {
        await updateHotel(id, convertedHotel);
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
      } catch (error) {
        Alert.alert("Error", "Failed to update hotel");
      }
    } else {
      setEditMode({ ...editMode, [id]: false });
    }
  };

  const handleConfirmDelete = (id: number) => {
    deleteHotel(id).catch((error) => {
      Alert.alert("Error", "Failed to delete hotel");
    });
    setDeleteModalVisible(null);
    setPosts(posts.filter((post) => post.id !== id));
    Alert.alert(
      "Deleted",
      labels[language].deleted || "Hotel has been deleted!"
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

  const renderRadioButton = (
    id: number,
    item: HotelType,
    field: string,
    value: string,
    label: string
  ) => (
    <TouchableOpacity
      key={`${field}-${value}`}
      style={styles.radioButton}
      onPress={() => handleEdit(id, field, value)}
    >
      <View style={styles.radioCircle}>
        {(editedValues[id]?.[field] === value ||
          (!editedValues[id]?.[field] &&
            ((field === "breakfast" &&
              value === (item.breakfast ? "Yes" : "No")) ||
              (field === "free_wifi" &&
                value === (item.free_wifi ? "Yes" : "No")) ||
              (field === "swimming_pool" &&
                value === (item.swimming_pool ? "Yes" : "No"))))) && (
          <Text style={styles.radioCheck}>✓</Text>
        )}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: HotelType }) => (
    <View style={styles.card}>
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
          <Text style={styles.label}>
            {labels[language].address || "Address"}:
          </Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.address || item.address || ""}
              onChangeText={(text) => handleEdit(item.id, "address", text)}
              placeholder="Enter address"
            />
          ) : (
            <Text style={styles.value}>{item.address || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].price || "Price"}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.price !== undefined
                  ? String(editedValues[item.id].price)
                  : String(item.price || 0)
              }
              onChangeText={(text) => handleEdit(item.id, "price", text)}
              placeholder="Enter price"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>
              {item.price ? `THB ${item.price}` : "N/A"}
            </Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].nearby || "Nearby Places"}:
          </Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.nearby_famous_places ||
                item.nearby_famous_places.join(", ") ||
                ""
              }
              onChangeText={(text) =>
                handleEdit(item.id, "nearby_famous_places", text)
              }
              placeholder="Enter nearby places (comma-separated)"
            />
          ) : (
            <View style={{ flexDirection: "column", width: "55%" }}>
              {item.nearby_famous_places.length > 0 ? (
                item.nearby_famous_places.map((place, index) => (
                  <Text key={index} style={styles.value}>
                    - {place}
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
            {labels[language].amenities || "Amenities"}:
          </Text>
          {editMode[item.id] ? (
            <View style={{ flexDirection: "column", width: "55%" }}>
              <Text style={styles.value}>Breakfast:</Text>
              <View style={styles.radioGroup}>
                {["Yes", "No"].map((value) =>
                  renderRadioButton(item.id, item, "breakfast", value, value)
                )}
              </View>
              <Text style={styles.value}>Free Wi-Fi:</Text>
              <View style={styles.radioGroup}>
                {["Yes", "No"].map((value) =>
                  renderRadioButton(item.id, item, "free_wifi", value, value)
                )}
              </View>
              <Text style={styles.value}>Swimming Pool:</Text>
              <View style={styles.radioGroup}>
                {["Yes", "No"].map((value) =>
                  renderRadioButton(
                    item.id,
                    item,
                    "swimming_pool",
                    value,
                    value
                  )
                )}
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: "column", width: "55%" }}>
              {item.breakfast && <Text style={styles.value}>• Breakfast</Text>}
              {item.free_wifi && <Text style={styles.value}>• Free Wi-Fi</Text>}
              {item.swimming_pool && (
                <Text style={styles.value}>• Swimming Pool</Text>
              )}
              {!item.breakfast && !item.free_wifi && !item.swimming_pool && (
                <Text style={styles.value}>N/A</Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].notes || "Notes"}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.notes || item.notes || ""}
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
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.imageContainer}>
          {editMode[item.id] ? (
            <>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={() => pickImages(item.id)}
              >
                <Text style={styles.imagePickerButtonText}>
                  {labels[language].addImages || "Add Images"}
                </Text>
              </TouchableOpacity>
              {editedValues[item.id]?.images?.length > 0 && (
                <View style={styles.previewContainer}>
                  {editedValues[item.id].images.map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={styles.previewImage}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.imageBackground}>
                <Carousel
                  ref={(ref) => {
                    if (ref) carouselRefs.current[item.id] = ref;
                  }}
                  width={styles.imageBackground.width}
                  height={150}
                  data={
                    item.images.length > 0
                      ? item.images
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
                          "AdminHotel: Image load error for item",
                          item.id,
                          error.nativeEvent
                        )
                      }
                    />
                  )}
                />
              </View>
              {item.images.length === 1 && (
                <View style={styles.noImages}></View>
              )}
              {(item.images.length > 1 ||
                (item.images.length === 0 &&
                  ["https://picsum.photos/340/200"].length > 1)) && (
                <View style={styles.sliderControls}>
                  <TouchableOpacity onPress={() => handlePrev(item.id)}>
                    <Text style={styles.arrow}>{"<"}</Text>
                  </TouchableOpacity>
                  <FlatList
                    horizontal
                    contentContainerStyle={styles.indicatorContainer}
                    data={
                      item.images.length > 0
                        ? item.images
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
                "Are you sure you want to delete this hotel?"}
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
              {labels[language].noHotels || "No hotels available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminHotel;
