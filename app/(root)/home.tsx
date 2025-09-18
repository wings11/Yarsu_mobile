import { router } from "expo-router";
import {
  Text,
  View,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { styles } from "@/assets/styles/home.styles";
import CategoryGrid from "@/components/CategoryGrid";
import { useLinks } from "@/hooks/useLinks";
import { useHighlights } from "@/hooks/useHighlights";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

const getGreeting = (language: "en" | "my") => {
  const hour = new Date().getHours();
  if (hour < 12) return labels[language].goodMorning;
  if (hour < 18) return labels[language].goodAfternoon;
  return labels[language].goodEvening;
};

interface HomeProps {
  toggleSidebar: () => void;
}

export default function Home({ toggleSidebar }: HomeProps) {
  const [user, setUser] = useState<{
    role: string;
    email: string | null;
    id: string | null;
    username?: string;
  } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { language, setLanguage } = useLanguage();
  const { links, loadLinks } = useLinks();
  const { highlights, loadHighlights } = useHighlights();

  const defaultBanners = [
    require("@/assets/images/banner.png"),
    require("@/assets/images/banner1.png"),
    require("@/assets/images/banner2.png"),
    require("@/assets/images/banner3.png"),
  ];

  // Map highlights to banner images, falling back to default banners
  const images = defaultBanners.map((defaultBanner, index) => {
    const highlight = highlights[index];
    return highlight && highlight.image ? { uri: highlight.image } : "";
  });

  const checkSessionWithRetry = async (retries = 3, delay = 500) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const storedToken = await getItem("authToken");
        console.log(
          `Home - Attempt ${attempt} - Stored authToken:`,
          storedToken ? "Found" : "Not found"
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error(
            `Home - Attempt ${attempt} - Session check error:`,
            error.message
          );
          if (storedToken) {
            console.log(
              `Home - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `Home - Attempt ${attempt} - User data from stored token:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log("Home - All retries failed, navigating to /index");
            router.replace("/index");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (session) {
          console.log(
            `Home - Attempt ${attempt} - Session found:`,
            session.user.email,
            session.user.id
          );
          const userData = await getUserRole();
          console.log(`Home - Attempt ${attempt} - User data:`, userData);
          setUser(userData);
          setIsSignedIn(true);
          return true;
        } else {
          console.log(`Home - Attempt ${attempt} - No session found`);
          if (storedToken) {
            console.log(
              `Home - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `Home - Attempt ${attempt} - User data from stored token:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log("Home - All retries failed, navigating to /index");
            router.replace("/index");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      } catch (error: any) {
        console.error(
          `Home - Attempt ${attempt} - Error checking session:`,
          error.message
        );
        if (attempt === retries) {
          const storedToken = await getItem("authToken");
          if (storedToken) {
            console.log(
              `Home - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `Home - Attempt ${attempt} - User data from stored token:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          setIsSignedIn(false);
          setUser(null);
          console.log("Home - All retries failed, navigating to /index");
          router.replace("/index");
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return false;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await checkSessionWithRetry();
        await loadLinks();
        await loadHighlights();
      } catch (error) {
        console.error("Home - Error loading data:", error);
      }
    };
    loadData();
  }, [loadLinks, loadHighlights]);

  useEffect(() => {
    console.log(`Home - Current language: ${language}`);
  }, [language]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const success = await checkSessionWithRetry();
      if (success) {
        await loadLinks();
        await loadHighlights();
        console.log("Home - Refresh: Session or token validated successfully");
      } else {
        console.log("Home - Refresh: Failed to validate session or token");
      }
    } catch (error) {
      console.error("Home - Refresh error:", error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  const handleSocialMediaPress = async (platform: string, url: string) => {
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.error(`Home - Cannot open ${platform} URL:`, url);
        }
      } catch (error: any) {
        console.error(`Home - Error opening ${platform} link:`, error.message);
      }
    }
  };

  const setLanguageToEnglish = () => {
    console.log("Home - Setting language to English");
    setLanguage("en");
  };

  const setLanguageToMyanmar = () => {
    console.log("Home - Setting language to Myanmar");
    setLanguage("my");
  };

  // Map links to platform buttons
  const socialMediaButtons = [
    {
      platform: "Telegram",
      icon: require("@/assets/images/tele.png"),
      url: links.find((link) => link.platform.toLowerCase() === "telegram")
        ?.url,
    },
    {
      platform: "FaceBook",
      icon: require("@/assets/images/fb.png"),
      url: links.find((link) => link.platform.toLowerCase() === "facebook")
        ?.url,
    },
    {
      platform: "Tiktok",
      icon: require("@/assets/images/tiktok.png"),
      url: links.find((link) => link.platform.toLowerCase() === "tiktok")?.url,
    },
    {
      platform: "YouTube",
      icon: require("@/assets/images/utube.png"),
      url: links.find((link) => link.platform.toLowerCase() === "youtube")?.url,
    },
  ].filter((button) => button.url); // Only show buttons with valid URLs

  if (isSignedIn === null) {
    return <View style={styles.container}></View>;
  }

  return (
    <View
      style={styles.container}
      {...(Platform.OS !== "web"
        ? { onStartShouldSetResponder: () => true }
        : {})}
    >
      {isSignedIn && user ? (
        <View style={styles.content}>
          <FlatList
            data={[{ key: "content" }]}
            showsVerticalScrollIndicator={false}
            renderItem={() => (
              <View>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>
                    {getGreeting(language)},{" "}
                    {user.username || user.email?.split("@")[0] || "User"}!
                  </Text>
                  <View style={styles.lanButton}>
                    <TouchableOpacity
                      onPress={setLanguageToMyanmar}
                      {...(Platform.OS !== "web"
                        ? { onStartShouldSetResponder: () => true }
                        : {})}
                    >
                      <Image
                        source={require("@/assets/images/MY.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity
                      onPress={setLanguageToEnglish}
                      {...(Platform.OS !== "web"
                        ? { onStartShouldSetResponder: () => true }
                        : {})}
                    >
                      <Image
                        source={require("@/assets/images/US.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ height: 150, alignItems: "center" }}>
                  <Animated.Image
                    source={images[currentImage]}
                    style={[styles.banner, { opacity: fadeAnim }]}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log(
                        `Home - Image load error for banner ${currentImage}:`,
                        error.nativeEvent,
                        `URL: ${JSON.stringify(images[currentImage])}`
                      );
                    }}
                  />
                </View>
                <Text style={styles.telegramText}>
                  {labels[language].socialMediaPrompt}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    marginHorizontal: "auto",
                  }}
                >
                  {socialMediaButtons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.joinTele}
                      onPress={() =>
                        handleSocialMediaPress(button.platform, button.url!)
                      }
                      {...(Platform.OS !== "web"
                        ? { onStartShouldSetResponder: () => true }
                        : {})}
                    >
                      <Image
                        source={button.icon}
                        style={styles.iconTele}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <CategoryGrid />
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.contentContainer}
          />
        </View>
      ) : (
        <Text style={styles.welcomeText}>{labels[language].signInPrompt}</Text>
      )}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{labels[language].footerText}</Text>
      </View>
    </View>
  );
}
