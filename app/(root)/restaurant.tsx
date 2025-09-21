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
  SafeAreaView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MediaPlayer from "@/components/MediaPlayer";
import { useRestaurants } from "@/hooks/useRestaurants";
import { labels } from "@/libs/language";
import { useLanguage } from "@/context/LanguageContext";
import { styles as rawStyles } from "@/assets/styles/restaurant.styles";
const styles = rawStyles as any;

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
  // Force a single-column layout for restaurant list
  const [numColumns] = useState(1);

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
    const windowWidth = Dimensions.get("window").width;
    const horizontalMargin = 20; // total horizontal margin/padding inside container
    const cardWidth = windowWidth - horizontalMargin; // full-width card with side margins
    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        onPress={() => handleCardPress(item)}
      >
        <Image
          source={{ uri: item.images[0] || "https://picsum.photos/200" }}
          style={[styles.cardImage, { height: cardWidth * 0.75 }]}
          resizeMode="cover"
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

      {/* Modal for selected restaurant (rendered outside FlatList) */}
      {selectedRestaurant && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.iconClose}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={28} color="#111" />
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

              <ScrollView
                style={styles.modalDetails}
                contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
              >
                <Text style={styles.modalTitle}>{selectedRestaurant.name}</Text>
                <View style={styles.modalRatingContainer}>
                  {renderStars(selectedRestaurant.admin_rating)}
                </View>

                {selectedRestaurant.location ? (
                  <View style={styles.modalDetailRow}>
                    <Image
                      source={require("@/assets/images/ping.png")}
                      style={styles.modalIcon}
                    />
                    {(() => {
                      const loc = selectedRestaurant.location?.trim();
                      const isLink = !!loc && /(^https?:\/\/)|(^www\.)|(maps\.google)|(google\.com\/maps)|(geo:)/i.test(loc);
                      if (isLink) {
                        const url = loc.startsWith("http") ? loc : `https://${loc}`;
                        return (
                          <TouchableOpacity
                            onPress={() => Linking.openURL(url)}
                            accessibilityRole="link"
                            accessibilityLabel={loc}
                          >
                            <Text
                              style={[
                                styles.modalDetailText,
                                { color: "#007AFF", textDecorationLine: "underline" },
                              ]}
                            >
                              {loc}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Text style={styles.modalDetailText}>{loc}</Text>
                      );
                    })()}
                  </View>
                ) : null}

                {selectedRestaurant.popular_picks && selectedRestaurant.popular_picks.length > 0 ? (
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
                ) : null}

                {selectedRestaurant.notes ? (
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="document-text" size={18} style={{ marginRight: 6 }} />
                    <Text
                      style={[
                        styles.modalDetailText,
                        { marginLeft: 2, flexShrink: 1 },
                      ]}
                    >
                      {selectedRestaurant.notes}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              {/* Media at bottom - uses MediaPlayer to handle images/videos */}
              <View style={styles.modalMediaContainer}>
                <MediaPlayer media={selectedRestaurant.images} width={Dimensions.get('window').width - 40} height={200} />
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

export default Restaurant;
