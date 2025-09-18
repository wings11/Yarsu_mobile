import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/course.styles";
import { useCourses } from "@/hooks/useCourses";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

const AdminCourse = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { courses, loadCourses, updateCourse, deleteCourse } = useCourses();
  const [posts, setPosts] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [editedValues, setEditedValues] = useState({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(null);
  const [numColumns, setNumColumns] = useState(3);
  const [refreshKey, setRefreshKey] = useState(0); // Added to force FlatList re-render

  useEffect(() => {
    const updateNumColumns = () => {
      const { width } = Dimensions.get("window");
      const minCardWidth = 200;
      const padding = 28 * 2;
      const margin = 10 * 2;
      const gap = 20;
      const availableWidth = width - padding - margin;
      const maxColumns = Math.floor(availableWidth / (minCardWidth + gap));
      setNumColumns(Math.max(1, Math.min(maxColumns, 3)));
    };

    updateNumColumns();
    const subscription = Dimensions.addEventListener(
      "change",
      updateNumColumns
    );
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadCourses().catch((error) => {
      console.error("Failed to load courses:", error);
      Alert.alert("Error", "Failed to load courses");
    });
  }, [loadCourses]);

  useEffect(() => {
    console.log("AdminCourse: Updating posts with courses", courses);
    setPosts(courses || []);
    setRefreshKey((prev) => prev + 1); // Force FlatList re-render
  }, [courses]);

  const handleEdit = (id, field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    const courseData = editedValues[id] || {};
    if (
      courseData.name &&
      courseData.duration &&
      courseData.price &&
      courseData.centre_name &&
      courseData.location
    ) {
      const updatedData = {
        name: courseData.name,
        duration: courseData.duration,
        price: Number(courseData.price),
        centre_name: courseData.centre_name,
        location: courseData.location,
        notes: courseData.notes || "",
      };
      try {
        console.log("Sending update request for course:", id, updatedData);
        await updateCourse(id, updatedData);
        setEditMode((prev) => ({ ...prev, [id]: false }));
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
        // Add slight delay to ensure loadCourses completes
        await new Promise((resolve) => setTimeout(resolve, 100));
        await loadCourses();
        console.log("Posts after loadCourses:", courses);
        Alert.alert(
          labels[language].saved || "Saved",
          labels[language].changesSaved || "Changes have been saved!"
        );
      } catch (error) {
        console.error("Error updating course:", error);
        setEditMode((prev) => ({ ...prev, [id]: false }));
        Alert.alert(
          labels[language].error || "Error",
          "Failed to update course"
        );
      }
    } else {
      Alert.alert(
        labels[language].error || "Error",
        labels[language].requiredFields || "All required fields must be filled"
      );
      setEditMode((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      setDeleteModalVisible(null);
      setPosts(posts.filter((post) => post.id !== id));
      Alert.alert(
        labels[language].deleted || "Deleted",
        labels[language].courseDeleted || "Course has been deleted!"
      );
    } catch (error) {
      console.error("Failed to delete course:", error);
      Alert.alert(labels[language].error || "Error", "Failed to delete course");
    }
  };

  const renderItem = ({ item }) => {
    if (!item) return null;
    const isEditing = editMode[item.id] || false;
    const currentValues = editedValues[item.id] || {};

    return (
      <View style={styles.card}>
        <View style={styles.detailsContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].coursename || "Name"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.name || item.name || ""}
                onChangeText={(text) => handleEdit(item.id, "name", text)}
                placeholder={labels[language].name || "Enter name"}
              />
            ) : (
              <Text style={styles.value}>{item.name || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].duration || "Duration"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.duration || item.duration || ""}
                onChangeText={(text) => handleEdit(item.id, "duration", text)}
                placeholder={labels[language].duration || "Enter duration"}
              />
            ) : (
              <Text style={styles.value}>{item.duration || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].courseprice || "Price"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={
                  currentValues.price !== undefined
                    ? String(currentValues.price)
                    : String(item.price || 0)
                }
                onChangeText={(text) => handleEdit(item.id, "price", text)}
                placeholder={labels[language].price || "Enter price"}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>
                {item.price ? `THB ${item.price}` : "N/A"}
              </Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].centreName || "Centre Name"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.centre_name || item.centre_name || ""}
                onChangeText={(text) =>
                  handleEdit(item.id, "centre_name", text)
                }
                placeholder={labels[language].centreName || "Enter centre name"}
              />
            ) : (
              <Text style={styles.value}>{item.centre_name || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].location || "Location"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.location || item.location || ""}
                onChangeText={(text) => handleEdit(item.id, "location", text)}
                placeholder={labels[language].location || "Enter location"}
              />
            ) : (
              <Text style={styles.value}>{item.location || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].notes || "Notes"}:
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.notes || item.notes || ""}
                onChangeText={(text) => handleEdit(item.id, "notes", text)}
                placeholder={labels[language].notes || "Enter notes"}
                multiline
              />
            ) : (
              <Text style={styles.value}>{item.notes || "N/A"}</Text>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSave(item.id)}
            >
              <Text style={styles.buttonText}>
                {labels[language].save || "Save"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                setEditMode((prev) => ({ ...prev, [item.id]: true }))
              }
            >
              <Text style={styles.buttonText}>
                {labels[language].edit || "Edit"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDeleteModalVisible(item.id)}
          >
            <Text style={styles.buttonText}>
              {labels[language].delete || "Delete"}
            </Text>
          </TouchableOpacity>
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
                  "Are you sure you want to delete this course?"}
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
                  onPress={() => handleDelete(item.id)}
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
      <View style={styles.listContainer}>
        <FlatList
          style={styles.list}
          showsVerticalScrollIndicator={false}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          numColumns={numColumns}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <Text style={styles.title}>
              {labels[language].noCourses || "No courses available"}
            </Text>
          }
          key={`${numColumns}-${refreshKey}`} // Force re-render
        />
      </View>
    </View>
  );
};

export default AdminCourse;
