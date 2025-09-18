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
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/doc.styles";
import { useDocs } from "@/hooks/useDoc";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import * as ImagePicker from "expo-image-picker";
import { supabase, setSupabaseAuthToken } from "@/libs/supabase";

type PostType = {
  id: number;
  text: string;
  media: string[] | null;
  created_at: string;
};

type EditedPostType = Partial<{
  text: string;
  media: string[];
}>;

const AdminDocs = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { posts, loadPosts, addPost, deletePost } = useDocs();
  const [docsPosts, setDocsPosts] = useState<PostType[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );
  const [videoModalVisible, setVideoModalVisible] = useState<string | null>(
    null
  );
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentIndices, setCurrentIndices] = useState<{
    [key: number]: number;
  }>({});
  const [numColumns, setNumColumns] = useState(3);
  const [newPost, setNewPost] = useState<EditedPostType>({
    text: "",
    media: [],
  });
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: number]: ICarouselInstance | null }>({});
  const videoRef = useRef<Video>(null);

  // Set Supabase auth token
  useEffect(() => {
    const token = process.env.REACT_APP_API_TOKEN || "";
    if (token) {
      setSupabaseAuthToken(token).catch((error) => {
        console.error("Error setting Supabase auth token:", error.message);
        Alert.alert("Error", "Failed to authenticate with Supabase.");
      });
    } else {
      Alert.alert("Error", "Authentication token is missing.");
    }
  }, []);

  // Request permissions for image and video picker
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant permission to access the photo library to add images or videos."
        );
      }
    })();
  }, []);

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
      console.log("AdminDocs: Initial fetch of posts");
      loadPosts();
      isInitialMount.current = false;
    }
  }, [loadPosts]);

  // Update posts when docs posts change
  useEffect(() => {
    console.log("AdminDocs: Updating posts", posts);
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

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newMedia = result.assets
        .filter((asset) => {
          if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
            Alert.alert(
              "Error",
              `Media ${asset.fileName || "selected"} exceeds 50MB limit.`
            );
            return false;
          }
          return true;
        })
        .map((asset) => asset.uri);
      setNewPost((prev) => ({
        ...prev,
        media: [...(prev.media || []), ...newMedia],
      }));
    }
  };

  const handleNewPostChange = (field: string, value: string) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreatePost = async () => {
    if (!newPost.text) {
      Alert.alert("Error", "Text is required for a new post.");
      return;
    }
    const postData: Partial<PostType> = { text: newPost.text };
    if (newPost.media && newPost.media.length > 0) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < newPost.media.length; i++) {
        const uri = newPost.media[i];
        const isVideo = uri.endsWith(".mp4") || uri.endsWith(".mov");
        const fileExtension = isVideo ? "mp4" : "jpg";
        const fileName = `docs-post-${Date.now()}-${i}.${fileExtension}`;
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const { error } = await supabase.storage
            .from("docs-images")
            .upload(fileName, blob, {
              contentType: isVideo ? "video/mp4" : "image/jpeg",
            });
          if (error) {
            console.error("Media upload error:", error.message, error);
            Alert.alert("Error", `Failed to upload media: ${error.message}`);
            return;
          }
          const { data } = supabase.storage
            .from("docs-images")
            .getPublicUrl(fileName);
          if (!data.publicUrl) {
            console.error("Failed to get public URL for", fileName);
            Alert.alert("Error", "Failed to retrieve media URL.");
            return;
          }
          uploadedUrls.push(data.publicUrl);
        } catch (error) {
          console.error("Unexpected error during media upload:", error);
          Alert.alert("Error", "Unexpected error during media upload.");
          return;
        }
      }
      postData.media = uploadedUrls;
    }
    try {
      const newPostData = await addPost(postData);
      setDocsPosts((prev) => [newPostData, ...prev]);
      setNewPost({ text: "", media: [] });
      setCreateModalVisible(false);
      Alert.alert(
        "Created",
        labels[language].created || "Post has been created!"
      );
    } catch (error) {
      console.error("Error creating post:", error.message);
      Alert.alert("Error", `Failed to create post: ${error.message}`);
    }
  };

  const handleConfirmDelete = (id: number) => {
    deletePost(id).catch((error) => {
      console.error("Error deleting post:", error.message);
      Alert.alert("Error", `Failed to delete post: ${error.message}`);
    });
    setDeleteModalVisible(null);
    setDocsPosts(docsPosts.filter((post) => post.id !== id));
    Alert.alert(
      "Deleted",
      labels[language].deleted || "Post has been deleted!"
    );
  };

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
    const cardWidth = (Dimensions.get("window").width - 40) / numColumns - 16;
    return (
      <View style={[styles.card, { width: cardWidth }]}>
        <View style={styles.detailsContainer}></View>
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
                              "AdminDocs: Video thumbnail load error for item",
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
                            "AdminDocs: Image load error for item",
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
          <View style={styles.noteTextBox}>
            <Text style={styles.value}>{item.text || "N/A"}</Text>
          </View>
          <View style={styles.buttonContainer}>
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
                  "Are you sure you want to delete this post?"}
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
      <TouchableOpacity
        style={[styles.button, { alignSelf: "center", marginVertical: 10 }]}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {labels[language].createPost || "Create New Post"}
        </Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.formContainer]}>
            <Text style={styles.title}>
              {labels[language].createPost || "Create New Post"}
            </Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>
                {labels[language].text || "Text"}:
              </Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={newPost.text || ""}
                onChangeText={(text) => handleNewPostChange("text", text)}
                placeholder={labels[language].text || "Enter text"}
                multiline
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>
                {labels[language].media || "Media"}:
              </Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickMedia}
              >
                <Text style={styles.imagePickerButtonText}>
                  {labels[language].addMedia || "Add Images or Videos"}
                </Text>
              </TouchableOpacity>
              {newPost.media?.length > 0 && (
                <View style={styles.previewContainer}>
                  {newPost.media.map((uri, index) => (
                    <View key={index} style={styles.mediaPreviewWrapper}>
                      {uri.endsWith(".mp4") || uri.endsWith(".mov") ? (
                        <>
                          <Image
                            source={{ uri: "https://picsum.photos/90/90" }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                          <Text style={styles.previewVideoText}>Video</Text>
                        </>
                      ) : (
                        <Image
                          source={{ uri }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].cancel || "Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleCreatePost}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].create || "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

export default AdminDocs;
