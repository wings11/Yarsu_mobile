import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTravel } from "@/hooks/useTravel";
import { styles } from "@/assets/styles/travel.styles";
import { formatDate } from "@/libs/utils";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { COLORS } from "@/constants/colors";

type TravelPostType = {
  id: number;
  name: string;
  place: string;
  highlights: string[];
  images: string[];
  admin_rating: number;
  created_at: string;
  note?: string;
};

const Travel = () => {
  const {
    travelPosts,
    selectedPost,
    showDetails,
    handleMoreInfo,
    loadTravelPosts,
    setShowDetails,
  } = useTravel();
  const { language } = useLanguage();
  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const carouselRef = useRef<ICarouselInstance | null>(null);
  const headerHeight = 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  useEffect(() => {
    loadTravelPosts();
  }, [loadTravelPosts]);

  useEffect(() => {
    let interval;
    if (showDetails && selectedPost?.images && selectedPost.images.length > 1) {
      interval = setInterval(() => {
        const nextIndex = (currentImageIndex + 1) % selectedPost.images.length;

        setCurrentImageIndex(nextIndex);
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ index: nextIndex, animated: true });
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
      console.log("Travel: Cleared auto-slide interval");
    };
  }, [showDetails, selectedPost, currentImageIndex]);

  useEffect(() => {
    if (showDetails) {
      Animated.timing(slideAnimDetails, {
        toValue: headerHeight,
        duration: 300,
        useNativeDriver: true,
      }).start(() => console.log("Travel: Modal slide-in animation completed"));
    } else {
      Animated.timing(slideAnimDetails, {
        toValue: Dimensions.get("window").height,
        duration: 300,
        useNativeDriver: true,
      }).start(() =>
        console.log("Travel: Modal slide-out animation completed")
      );
    }
  }, [showDetails, slideAnimDetails, headerHeight]);

  const renderItem = ({
    item,
    index,
  }: {
    item: TravelPostType;
    index: number;
  }) => {
    const baseHeight = 150;
    const doubleHeight = baseHeight * 2 + 8;
    const reducedHeight = baseHeight;

    const isDiv1 = index % 4 === 0;
    const isDiv2 = index % 4 === 1;
    const isDiv3 = index % 4 === 2;
    const isDiv4 = index % 4 === 3;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isDiv1 && { height: doubleHeight - 118 },
          isDiv2 && { height: reducedHeight },
          isDiv3 && { height: reducedHeight },
          isDiv4 && {
            height: doubleHeight - 118,
            marginTop: -baseHeight * 0.27,
          },
        ]}
        onPress={() => {
          handleMoreInfo(item);
          setShowDetails(true);
          setIsNoteExpanded(false);
        }}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={styles.cardImage}
          onError={(error) =>
            console.error(
              "Travel: Image load error for item",
              item.id,
              error.nativeEvent
            )
          }
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.overlayText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStar = () => {
    const stars = [];
    const fullStars = Math.floor(selectedPost?.admin_rating || 0);
    const hasHalfStar = selectedPost?.admin_rating % 1 >= 0.5;
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

  const handlePrev = () => {
    const prevIndex =
      (currentImageIndex - 1 + (selectedPost?.images.length || 1)) %
      (selectedPost?.images.length || 1);
    setCurrentImageIndex(prevIndex);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index: prevIndex, animated: true });
    }
  };

  const handleNext = () => {
    const nextIndex =
      (currentImageIndex + 1) % (selectedPost?.images.length || 1);
    setCurrentImageIndex(nextIndex);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index: nextIndex, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardTitle}>
        <Text style={styles.cardTitleText1}>
          {labels[language].makeEveryTrip || "Make every trip a"}
        </Text>
        <Text style={styles.cardTitleText2}>
          {labels[language].memory || "Memory"}
        </Text>
      </View>
      {travelPosts.length === 0 ? (
        <Text style={styles.title}>
          Travel: Loading travel posts... (Length: {travelPosts.length})
        </Text>
      ) : (
        <FlatList
          data={travelPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={<Text>Travel: No travel posts available</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}

      {showDetails && selectedPost && (
        <Animated.View
          style={[
            styles.customModalOverlay,
            { transform: [{ translateY: slideAnimDetails }] },
          ]}
        >
          <View style={styles.modalContainer}>
            <View style={styles.customModalContent}>
              <TouchableOpacity
                style={styles.closeIconButton}
                onPress={() => {
                  setShowDetails(false);
                  setIsNoteExpanded(false);
                }}
              >
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalBody}
              >
                <View style={styles.imageContainer}>
                  <TouchableOpacity
                    style={styles.arrowContainer}
                    onPress={handlePrev}
                  >
                    <Text style={styles.arrow}>{"<"}</Text>
                  </TouchableOpacity>
                  <Carousel
                    ref={carouselRef}
                    width={Dimensions.get("window").width - 90}
                    height={300}
                    data={
                      selectedPost.images.length > 0
                        ? selectedPost.images
                        : ["https://picsum.photos/340/200"]
                    }
                    scrollAnimationDuration={300}
                    defaultIndex={currentImageIndex}
                    onSnapToItem={(index) => {
                      setCurrentImageIndex(index);
                    }}
                    renderItem={({ item: image }) => (
                      <Image
                        source={{ uri: image }}
                        style={styles.modalImage}
                      />
                    )}
                  />
                  <TouchableOpacity
                    style={styles.arrowContainer}
                    onPress={handleNext}
                  >
                    <Text style={styles.arrow}>{">"}</Text>
                  </TouchableOpacity>
                </View>
                {selectedPost.images.length > 1 && (
                  <View style={styles.sliderControls}>
                    <View style={styles.indicatorContainer}>
                      {selectedPost.images.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.indicator,
                            currentImageIndex === index &&
                              styles.activeIndicator,
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}
                <View style={styles.detailsContainer}>
                  <Text style={styles.modalTitle}>{selectedPost.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={require("@/assets/images/ping.png")}
                      style={{ height: 24, width: 24, marginRight: 8 }}
                    />
                    <Text style={styles.modalText}>
                      {labels[language].place || "Place"}: {selectedPost.place}
                    </Text>
                  </View>
                  <Text style={styles.modalHighlightTitle}>
                    {labels[language].highlights || "Highlights"}
                  </Text>
                  {selectedPost.highlights.map((highlight, index) => (
                    <View style={styles.highlightItem} key={index}>
                      <LinearGradient
                        colors={["#FFF236", "#FFBA30"]}
                        style={styles.highlightDot}
                        start={{ x: 0.25, y: 0.15 }}
                        end={{ x: 0.75, y: 0.85 }}
                      />
                      <Text style={styles.modalText}>{highlight}</Text>
                    </View>
                  ))}
                  <Text style={styles.modalHighlightTitle}>
                    {labels[language].rating || "Rating"} - {renderStar()}
                  </Text>
                  <Text style={styles.modalHighlightTitle}>
                    {labels[language].posted || "Posted"} -
                    <Text style={styles.modalText}>
                      {formatDate(selectedPost.created_at)}
                    </Text>
                  </Text>
                  <View style={styles.noteDropdownContainer}>
                    <TouchableOpacity
                      style={styles.noteTextBox}
                      onPress={() => setIsNoteExpanded(!isNoteExpanded)}
                    >
                      <View
                        style={[
                          styles.noteTextContainer,
                          !isNoteExpanded && styles.collapsedNoteText,
                        ]}
                      >
                        <Text style={styles.modalText}>
                          {selectedPost.note || "No additional notes available"}
                        </Text>
                      </View>
                      <Ionicons
                        name={isNoteExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={COLORS.black}
                        style={styles.dropdownArrow}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default Travel;
