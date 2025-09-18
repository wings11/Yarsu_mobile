import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/doc.styles";
import { useDocs } from "@/hooks/useDoc";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { COLORS } from "@/constants/colors";

type PostType = {
  id: number;
  text: string;
  media: string[] | null;
  created_at: string;
};

const Document = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { posts, loadPosts } = useDocs();
  const [docsPosts, setDocsPosts] = useState<PostType[]>([]);
  const [videoModalVisible, setVideoModalVisible] = useState<string | null>(
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
  const videoRef = useRef<Video>(null);

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      if (width >= 1024) {
        setNumColumns(3);
      } else if (width >= 600) {
        setNumColumns(2);
      } else {
        setNumColumns(1);
      }
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (isInitialMount.current) {
      console.log("Document: Initial fetch of posts");
      loadPosts();
      isInitialMount.current = false;
    }
  }, [loadPosts]);

  // Update posts when docs posts change
  useEffect(() => {
    console.log("Document: Updating posts", posts);
    posts.forEach((post, index) => {
      if (!post || !post.id || post.media === undefined) {
        console.warn(`Invalid post at index ${index}:`, post);
      }
    });
    const validPosts = posts
      .filter(
        (post): post is PostType =>
          !!post && !!post.id && post.media !== undefined
      )
      .map((post) => ({
        ...post,
        media: post.media || [],
      }));
    setDocsPosts(validPosts);
    const initialIndices = validPosts.reduce((acc, post) => {
      acc[post.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
    const initialNoteExpanded = validPosts.reduce((acc, post) => {
      acc[post.id] = false;
      return acc;
    }, {} as { [key: number]: boolean });
    setIsNoteExpanded(initialNoteExpanded);
  }, [posts]);

  // Auto-slide images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        docsPosts.forEach((post) => {
          if (carouselRefs.current[post.id]) {
            const totalImages = post.media?.length || 1;
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
  }, [docsPosts]);

  const handlePrev = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages =
        docsPosts.find((p) => p.id === id)?.media?.length || 1;
      const newIndex = (currentIndex - 1 + totalImages) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages =
        docsPosts.find((p) => p.id === id)?.media?.length || 1;
      const newIndex = (currentIndex + 1) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: PostType }) => {
    const cardWidth = 300;
    return (
      <View style={[styles.card, { width: cardWidth }]}>
        <View style={styles.bottomContainer}>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => handlePrev(item.id)}>
              <Text style={styles.arrow}>{"<"}</Text>
            </TouchableOpacity>
            <View style={[styles.imageBackground, { width: cardWidth - 80 }]}>
              <Carousel
                ref={(ref) => {
                  if (ref) carouselRefs.current[item.id] = ref;
                }}
                width={cardWidth - 80}
                height={200}
                data={
                  item.media?.length
                    ? item.media
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
                renderItem={({ item: media }) => (
                  <View style={styles.mediaPreviewWrapper}>
                    {media.endsWith(".mp4") || media.endsWith(".mov") ? (
                      <TouchableOpacity
                        onPress={() => setVideoModalVisible(media)}
                        style={styles.innerImage}
                      >
                        <Image
                          source={{ uri: "https://picsum.photos/340/200" }}
                          style={styles.innerImage}
                          resizeMode="cover"
                          onError={(error) =>
                            console.error(
                              "Document: Video thumbnail load error for item",
                              item.id,
                              error.nativeEvent
                            )
                          }
                        />
                        <View style={styles.playButton}>
                          <Text style={styles.playButtonText}>▶</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Image
                        source={{ uri: media }}
                        style={styles.innerImage}
                        resizeMode="cover"
                        onError={(error) =>
                          console.error(
                            "Document: Image load error for item",
                            item.id,
                            error.nativeEvent
                          )
                        }
                      />
                    )}
                  </View>
                )}
              />
            </View>
            <TouchableOpacity onPress={() => handleNext(item.id)}>
              <Text style={styles.arrow}>{">"}</Text>
            </TouchableOpacity>
          </View>
          {item.media?.length === 1 && <View style={styles.noImages}></View>}
          {(item.media?.length > 1 ||
            (!item.media?.length &&
              ["https://picsum.photos/340/200"].length > 1)) && (
            <View style={styles.sliderControls}>
              <FlatList
                horizontal
                contentContainerStyle={styles.indicatorContainer}
                data={
                  item.media?.length
                    ? item.media
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
            </View>
          )}
          <View style={styles.detailsContainer}>
            {item.text && (
              <View style={styles.noteDropdownContainer}>
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
                    <Text style={styles.value}>{item.text || "N/A"}</Text>
                  </View>
                  <Ionicons
                    name={
                      isNoteExpanded[item.id] ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={COLORS.black}
                    style={styles.dropdownArrow}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <Modal
          transparent={true}
          visible={!!videoModalVisible}
          onRequestClose={() => setVideoModalVisible(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { padding: 0, width: "90%", height: "50%" },
              ]}
            >
              {videoModalVisible && (
                <Video
                  ref={videoRef}
                  source={{ uri: videoModalVisible }}
                  style={{ width: "100%", height: "100%", borderRadius: 8 }}
                  useNativeControls
                  resizeMode="contain"
                  onError={(error) =>
                    console.error("Video playback error:", error)
                  }
                />
              )}
              <TouchableOpacity
                style={[styles.closeButton, { top: 10, right: 10 }]}
                onPress={() => setVideoModalVisible(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
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
          data={docsPosts.filter((item) => item && item.id)}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `fallback-${index}`
          }
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          numColumns={numColumns}
          columnWrapperStyle={
            numColumns > 1
              ? {
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                }
              : undefined
          }
          ListEmptyComponent={
            <Text style={styles.title}>
              {labels[language].noPosts || "No posts available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default Document;
