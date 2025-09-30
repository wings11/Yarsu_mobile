import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useCourses } from "@/hooks/useCourses";
import { styles } from "@/assets/styles/course.styles";
import { formatDate } from "@/libs/utils";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

type CourseType = {
  id: number;
  name?: string;
  duration?: string;
  price?: number | null;
  centre_name?: string;
  location?: string;
  created_at?: string;
  notes?: string | null;
};

const fmtPrice = (price?: number | null) => {
  if (price == null || Number(price) === 0) return "Free";
  try {
    return typeof Intl !== "undefined"
      ? new Intl.NumberFormat().format(Number(price))
      : String(price);
  } catch {
    return String(price);
  }
};

const Course = () => {
  const {
    courses,
    selectedCourse,
    showDetails,
    handleMoreInfo,
    loadCourses,
    setShowDetails,
  } = useCourses();

  const { language } = useLanguage();
  const L = (labels as any)[language] || {};

  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    Animated.timing(slideAnimDetails, {
      toValue: showDetails ? 0 : Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => !showDetails && setShowDetails(false));
  }, [showDetails, slideAnimDetails, setShowDetails]);

  const renderItem = ({ item }: { item: CourseType }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        handleMoreInfo(item as any);
        setShowDetails(true);
      }}
    >
      <Image source={require("@/assets/images/course.png")} style={styles.cardImage} />
      <View style={styles.cardMeta}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name || "Untitled Course"}
        </Text>
        <Text style={styles.cardSubtitle}>{item.duration || "-"}</Text>
      </View>
      <View style={styles.priceBadge} pointerEvents="none">
        <Text style={[styles.footerText, { fontWeight: "700" }]}>{fmtPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {(!courses || courses.length === 0) ? (
        <Text style={styles.title}>{L.loadingCourses || "Loading courses..."}</Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(i: any) => String(i.id)}
          renderItem={renderItem}
          numColumns={1}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text>{L.noCourses || "No courses available"}</Text>}
        />
      )}

      {showDetails && selectedCourse && (
        <Animated.View style={[styles.customModalOverlay, { transform: [{ translateY: slideAnimDetails }] }]}>
          <View style={styles.modalContainer}>
            <View style={styles.customModalContent}>
              <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 16 }}>
                <View style={styles.textbox}>
                  <Image source={require("@/assets/images/clock.png")} style={styles.image} />
                  <View style={styles.textboxContainer}>
                    <Text>{L.coursename || "Course Name"}</Text>
                    <Text style={styles.modalTitle}>{(selectedCourse as any)?.name}</Text>
                  </View>
                </View>

                <View style={styles.textbox}>
                  <Image source={require("@/assets/images/clock.png")} style={styles.image} />
                  <View style={styles.textboxContainer}>
                    <Text>{L.duration || "Duration"}</Text>
                    <Text style={styles.modalTitle}>{(selectedCourse as any)?.duration || "N/A"}</Text>
                  </View>
                </View>

                <View style={styles.textbox}>
                  <Image source={require("@/assets/images/clock.png")} style={styles.image} />
                  <View style={styles.textboxContainer}>
                    <Text>{L.courseprice || "Course Fees"}</Text>
                    <Text style={styles.modalTitle}>{fmtPrice((selectedCourse as any)?.price)}</Text>
                  </View>
                </View>

                <View style={styles.textbox}>
                  <Image source={require("@/assets/images/clock.png")} style={styles.image} />
                  <View style={styles.textboxContainer}>
                    <Text>{L.centreName || "Centre Name"}</Text>
                    <Text style={styles.modalTitle}>{(selectedCourse as any)?.centre_name || "-"}</Text>
                  </View>
                </View>

                <View style={styles.textbox}>
                  <Image source={require("@/assets/images/clock.png")} style={styles.image} />
                  <View style={styles.textboxContainer}>
                    <Text>{L.location || "Location"}</Text>
                    <Text style={styles.modalTitle}>{(selectedCourse as any)?.location || "-"}</Text>
                  </View>
                </View>

                <View style={styles.textbox}>
                  <Image source={require("@/assets/images/clock.png")} style={styles.image} />
                  <View style={styles.textboxContainer}>
                    <Text>{L.notes || "Notes"}</Text>
                    <Text style={styles.modalTitle}>{(selectedCourse as any)?.notes || "-"}</Text>
                  </View>
                </View>

                <View style={styles.textbox}>
                  <Image source={require("@/assets/images/clock.png")} style={styles.image} />
                  <View style={styles.textboxContainer}>
                    <Text>{L.postedDate || "Posted Date"}</Text>
                    <Text style={styles.modalTitle}>{formatDate((selectedCourse as any)?.created_at)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
                  <Text style={styles.buttonText}>{L.contact || "Contact"}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default Course;
