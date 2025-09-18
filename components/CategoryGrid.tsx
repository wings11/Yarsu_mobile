import { useRouter } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { styles } from "@/assets/styles/home.styles";
import { COLORS } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

const categories = [
  {
    name: "jobs",
    icon: require("@/assets/images/jobicon.png"),
    color: COLORS.white,
    route: "/job",
  },
  {
    name: "travel",
    icon: require("@/assets/images/travelicon.png"),
    color: COLORS.white,
    route: "/travel",
  },
  {
    name: "condo",
    icon: require("@/assets/images/condoicon.png"),
    color: COLORS.white,
    route: "/condo",
  },
  {
    name: "hotels",
    icon: require("@/assets/images/hotelicon.png"),
    color: COLORS.white,
    route: "/hotel",
  },
  {
    name: "courses",
    icon: require("@/assets/images/courseicon.png"),
    color: COLORS.white,
    route: "/course",
  },
  {
    name: "documents",
    icon: require("@/assets/images/detailicon.png"),
    color: COLORS.white,
    route: "/document",
  },
  {
    name: "restaurants",
    icon: require("@/assets/images/restauranticon.png"),
    color: COLORS.white,
    route: "/restaurant",
  },
  {
    name: "general",
    icon: require("@/assets/images/generalicon.png"),
    color: COLORS.white,
    route: "/general",
  },
];

const CategoryGrid = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const fadeAnims = useRef(categories.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(
    categories.map(() => new Animated.Value(50))
  ).current;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    console.log(
      `CategoryGrid - Language: ${language}, Jobs: ${labels[language].jobs}`
    );
  }, [language]);

  useEffect(() => {
    categories.forEach((_, index) => {
      Animated.parallel([
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleCategoryClick = (route: string) => {
    console.log(`CategoryGrid - Navigating to ${route}`);
    router.push(route);
  };

  const handlePressIn = (index: number) => {
    setActiveIndex(index);
  };

  const handlePressOut = () => {
    setActiveIndex(null);
  };

  return (
    <View style={styles.grid}>
      {categories.map((category, index) => (
        <Animated.View
          key={category.name}
          style={[
            styles.card,
            {
              opacity: fadeAnims[index],
              transform: [{ translateY: slideAnims[index] }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  activeIndex === index ? COLORS.background : category.color,
              },
            ]}
            onPress={() => handleCategoryClick(category.route)}
            onPressIn={() => handlePressIn(index)}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
            {...(Platform.OS !== "web"
              ? { onStartShouldSetResponder: () => true }
              : {})}
          >
            <Image
              source={category.icon}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Animated.Text
              style={[
                activeIndex === index ? styles.cardTextActive : styles.cardText,
              ]}
            >
              {labels[language][category.name as keyof typeof labels.en] ||
                category.name}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

export default CategoryGrid;
