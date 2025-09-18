import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, Image, Animated } from "react-native";
import { useRef, useEffect, useState } from "react";
import { styles } from "@/assets/styles/adminstyles/admin.styles";
import { COLORS } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext"; // Import useLanguage
import { labels } from "@/libs/language"; // Import labels

const adminCategories = [
  {
    name: "adminJobs", // Use label keys instead of hardcoded names
    icon: require("@/assets/images/jobicon.png"),
    route: "/(admin)/adminJob",
  },
  {
    name: "adminTravel",
    icon: require("@/assets/images/travelicon.png"),
    route: "/(admin)/adminTravel",
  },
  {
    name: "adminCondo",
    icon: require("@/assets/images/condoicon.png"),
    route: "/(admin)/adminCondo",
  },
  {
    name: "adminHotels",
    icon: require("@/assets/images/hotelicon.png"),
    route: "/(admin)/adminHotel",
  },
  {
    name: "adminDocument",
    icon: require("@/assets/images/detailicon.png"),
    route: "/(admin)/adminDoc",
  },
  {
    name: "adminRestaurants",
    icon: require("@/assets/images/restauranticon.png"),
    route: "/(admin)/adminRestaurant",
  },
  {
    name: "adminCourses",
    icon: require("@/assets/images/courseicon.png"),
    route: "/(admin)/adminCourse",
  },
  {
    name: "adminGeneral",
    icon: require("@/assets/images/generalicon.png"),
    route: "/(admin)/adminGeneral",
  },
];

const AdminCategoryGrid = () => {
  const router = useRouter();
  const { language } = useLanguage(); // Access current language from context
  const fadeAnims = useRef(
    adminCategories.map(() => new Animated.Value(0))
  ).current;
  const slideAnims = useRef(
    adminCategories.map(() => new Animated.Value(50))
  ).current;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    adminCategories.forEach((_, index) => {
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
      {adminCategories.map((category, index) => (
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
            onPress={() => handleCategoryClick(category.route)}
            onPressIn={() => handlePressIn(index)}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <Animated.Text
              style={[
                activeIndex === index ? styles.cardTextActive : styles.cardText,
              ]}
            >
              {labels[language][category.name as keyof typeof labels.en] ||
                category.name}{" "}
              {/* Dynamic label */}
            </Animated.Text>
            <Image source={category.icon} style={styles.cardIcon} />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

export default AdminCategoryGrid;
