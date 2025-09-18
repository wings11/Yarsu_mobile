import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRestaurants } from "@/hooks/useRestaurants";
import { styles } from "@/assets/styles/restaurant.styles";
import { labels } from "@/libs/language";
import { useLanguage } from "@/context/LanguageContext";

type RestaurantType = {
  id: number;
  name: string;
  location: string;
  images: string[];
  popular_picks: string[];
  admin_rating: number;
  notes: string;
  created_at: string;
};

const Restaurant = () => {
  const { language } = useLanguage();
  const { restaurants, loadRestaurants } = useRestaurants();
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [numColumns, setNumColumns] = useState(4);

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const windowWidth = Dimensions.get("window").width;
      const containerPadding = 15;
      const cardMargin = 10;
      const minCardWidth = 150; // Minimum card width to prevent cards from being too small
      const availableWidth = windowWidth - containerPadding * 2;
      const maxColumns = Math.floor(
        availableWidth / (minCardWidth + cardMargin * 2)
      );
      setNumColumns(Math.min(4, maxColumns || 1)); // Max 4 columns, min 1
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  // Fetch restaurants on mount
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? "★" : "☆"}
        </Text>
      );
    }
    return stars;
  };

  const handleCardPress = (restaurant: RestaurantType) => {
    setSelectedRestaurant(restaurant);
    setCurrentImageIndex(0);
    setModalVisible(true);
  };

  const handlePrevImage = () => {
    if (selectedRestaurant) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedRestaurant.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedRestaurant) {
      setCurrentImageIndex((prev) =>
        prev === selectedRestaurant.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const renderItem = ({ item }: { item: RestaurantType }) => {
    const windowWidth = 430;
    const containerPadding = 15;
    const cardMargin = 10;
    const cardWidth =
      (windowWidth - containerPadding * 2 - cardMargin * (numColumns + 1)) /
      numColumns;
    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        onPress={() => handleCardPress(item)}
      >
        <Image
          source={{ uri: item.images[0] || "https://picsum.photos/200" }}
          style={[styles.cardImage, { height: cardWidth * 0.75 }]}
          resizeMode="cover"
          // onError={(error) =>
          //   console.error("Image load error:", error.nativeEvent)
          // }
        />
        <View style={styles.textContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/food.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>{item.name}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/thumb.png")}
              style={styles.logo}
            />
            <Text style={styles.detailText}>
              {item.popular_picks.join(", ")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardTitle}>
        <Text style={styles.cardTitleText1}>{labels[language].your}</Text>
        <Text style={styles.cardTitleText2}>{labels[language].foodguide}</Text>
      </View>
      {restaurants.length === 0 ? (
        <Text style={styles.title}>Loading restaurants...</Text>
      ) : (
        <FlatList
          data={restaurants}
          style={styles.gridContainer}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          key={`flatlist-${numColumns}`}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={
            numColumns > 1
              ? {
                  flexWrap: "wrap",
                  paddingHorizontal: 8,
                }
              : undefined
          }
          ListEmptyComponent={<Text>No restaurants available</Text>}
        />
      )}
      {selectedRestaurant && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <View style={styles.modalImageContainer}>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={handlePrevImage}
                >
                  <Text style={styles.arrowText}>{"<"}</Text>
                </TouchableOpacity>
                <Image
                  source={{
                    uri:
                      selectedRestaurant.images[currentImageIndex] ||
                      "https://picsum.photos/400",
                  }}
                  style={styles.modalImage}
                  resizeMode="contain"
                  // onError={(error) =>
                  //   console.error("Modal image load error:", error.nativeEvent)
                  // }
                />
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={handleNextImage}
                >
                  <Text style={styles.arrowText}>{">"}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.indicatorContainer}>
                {selectedRestaurant.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
              <ScrollView style={styles.modalDetails}>
                <Text style={styles.modalTitle}>{selectedRestaurant.name}</Text>
                <View style={styles.modalRatingContainer}>
                  {renderStars(selectedRestaurant.admin_rating)}
                </View>
                <View style={styles.modalDetailRow}>
                  <Image
                    source={require("@/assets/images/ping.png")}
                    style={styles.modalIcon}
                  />
                  <Text style={styles.modalDetailText}>
                    {selectedRestaurant.location}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Image
                    source={require("@/assets/images/thumb.png")}
                    style={styles.modalIcon}
                  />
                  <View>
                    {selectedRestaurant.popular_picks.map((pick, index) => (
                      <Text key={index} style={styles.modalDetailText}>
                        {pick}
                      </Text>
                    ))}
                  </View>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.detailText}>
                    {labels[language].notes}:
                  </Text>
                  <View style={styles.notes}>
                    <Text>{selectedRestaurant.notes || "N/A"}</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default Restaurant;
