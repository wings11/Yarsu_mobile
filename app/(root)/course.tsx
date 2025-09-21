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
import { styles as rawStyles } from "@/assets/styles/course.styles";
import { useCourses } from "@/hooks/useCourses";
import { formatDate } from "@/libs/utils";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
const styles = rawStyles as any;

// Define the Course type (matches DB schema)
type CourseType = {
  id: number;
  name: string;
  duration: string;
  price: number; // numeric(10,2) in DB, frontend treats 0 as Free
  centre_name: string;
  location: string;
  created_at: string;
  notes?: string | null;
};

const Course = () => {
  const {
    courses,
    selectedCourse,
    showDetails,
    handleMoreInfo,
    loadCourses,
    setShowDetails,
  } = useCourses() as {
    courses: CourseType[];
    selectedCourse: CourseType | null;
    showDetails: boolean;
    fetchCourses: () => void;
    handleMoreInfo: (course: CourseType) => void;
    loadCourses: () => void;
    setShowDetails: (show: boolean) => void;
  };
  const { language } = useLanguage(); // Add language hook
  const L = (labels as any)[language] || {};

  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const headerHeight = 0; // Adjust to match your Layout header height

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    // Debug: log courses so we can verify data shape in Metro/device logs
    try {
      console.log("[Course screen] courses count:", courses?.length);
      if (courses && courses.length > 0) console.log("[Course screen] first item:", JSON.stringify(courses[0]));
    } catch (e) {
      console.log("[Course screen] failed logging courses", e);
    }
  }, [courses]);

  useEffect(() => {
    if (showDetails) {
      Animated.timing(slideAnimDetails, {
        toValue: headerHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimDetails, {
        toValue: Dimensions.get("window").height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showDetails, slideAnimDetails, headerHeight]);

  const renderItem = ({ item }: { item: CourseType }) => {
    // Defensive access helpers for fields that might have alternate keys
    const getField = (obj: any, ...keys: string[]) => {
      for (const k of keys) {
        if (obj && obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") return obj[k];
      }
      return null;
    };

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleMoreInfo(item)} activeOpacity={0.85}>
        <View style={styles.cardTop}>
          <Image
            source={require("@/assets/images/course.png")}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
              {getField(item, 'name', 'course_name') || (L.coursename || "Untitled Course")}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Text style={[styles.cardSubtitle, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                {getField(item, 'duration', 'course_duration') || (L.duration || 'Duration not set')}
              </Text>
              <Text style={[styles.footerText, { fontWeight: '700' }]} numberOfLines={1} ellipsizeMode="tail"> 
                {(item.price == null || item.price === 0)
                  ? (L.free || "Free")
                  : (typeof Intl !== 'undefined'
                      ? new Intl.NumberFormat().format(Number(item.price))
                      : String(item.price))}
              </Text>
            </View>
            <Text style={[styles.cardSubtitle, { marginTop: 6 }]} numberOfLines={1} ellipsizeMode="tail">
              {getField(item, 'location', 'place') || (L.location || 'Location not set')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {courses.length === 0 ? (
        <Text style={styles.title}>{L.loadingCourses || "Loading courses..."}</Text>
      ) : (
        <FlatList
          data={courses}
          contentContainerStyle={styles.gridContainer}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text>{L.noCourses || "No courses available"}</Text>}
        />
      )}

      {showDetails && (
        <Animated.View style={[styles.customModalOverlay, { transform: [{ translateY: slideAnimDetails }] }]}>
          <View style={styles.modalContainer}>
            <View style={styles.customModalContent}>
              <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 16 }}>
                {selectedCourse && (
                  <>
                    <View style={styles.textbox}>
                      <Image source={require("@/assets/images/clock.png")} style={styles.image} resizeMode="cover" />
                      <View style={styles.textboxContainer}>
                        <Text>{L.coursename || "Course Name"}</Text>
                        <Text style={styles.modalTitle}>{selectedCourse.name}</Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image source={require("@/assets/images/clock.png")} style={styles.image} resizeMode="cover" />
                      <View style={styles.textboxContainer}>
                        <Text>{L.duration || "Duration"}</Text>
                        <Text style={styles.modalTitle}>{selectedCourse.duration || L.notAvailable || "N/A"}</Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image source={require("@/assets/images/clock.png")} style={styles.image} resizeMode="cover" />
                      <View style={styles.textboxContainer}>
                        <Text>{L.courseprice || "Course Fees"}</Text>
                        <Text style={styles.modalTitle}>{(selectedCourse.price == null || selectedCourse.price === 0) ? (L.free || "Free") : String(selectedCourse.price)}</Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image source={require("@/assets/images/clock.png")} style={styles.image} resizeMode="cover" />
                      <View style={styles.textboxContainer}>
                        <Text>{L.centreName || "Centre Name"}</Text>
                        <Text style={styles.modalTitle}>{(selectedCourse as any).centre_name || L.notAvailable || "N/A"}</Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image source={require("@/assets/images/clock.png")} style={styles.image} resizeMode="cover" />
                      <View style={styles.textboxContainer}>
                        <Text>{L.location || "Location"}</Text>
                        <Text style={styles.modalTitle}>{selectedCourse.location}</Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image source={require("@/assets/images/clock.png")} style={styles.image} resizeMode="cover" />
                      <View style={styles.textboxContainer}>
                        <Text>{L.notes || "Notes"}</Text>
                        <Text style={styles.modalTitle}>{(selectedCourse as any).notes || L.notAvailable || "N/A"}</Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image source={require("@/assets/images/clock.png")} style={styles.image} resizeMode="cover" />
                      <View style={styles.textboxContainer}>
                        <Text>{L.postedDate || "Posted Date"}</Text>
                        <Text style={styles.modalTitle}>{formatDate(selectedCourse.created_at)}</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
                      <Text style={styles.buttonText}>{L.contact || "Contact"}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );

};

export default Course;
