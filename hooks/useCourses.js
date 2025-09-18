import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phonenumber: "",
    address: "",
    birthday: "",
    thailanguage: false,
    gender: false,
  });

  const fetchCourses = useCallback(async () => {
    console.log("Fetching courses from:", `${API_URL}/courses`);
    try {
      const response = await fetch(`${API_URL}/courses`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched courses:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  const createCourse = useCallback(async (courseData) => {
    console.log("Creating course:", courseData);
    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newCourse = await response.json();
      setCourses((prev) => [...prev, newCourse]);
      return newCourse;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }, []);

  const updateCourse = useCallback(
    async (id, courseData) => {
      console.log("Updating course:", id, courseData);
      try {
        const response = await fetch(`${API_URL}/courses/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedCourse = await response.json();
        console.log("Updated course response:", updatedCourse);
        // Force refresh by fetching all courses
        await fetchCourses();
        console.log("Courses after update:", courses);
        return updatedCourse;
      } catch (error) {
        console.error("Error updating course:", error);
        throw error;
      }
    },
    [fetchCourses]
  );

  const deleteCourse = useCallback(async (id) => {
    console.log("Deleting course:", id);
    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setCourses((prev) => prev.filter((course) => course.id !== id));
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  }, []);

  const handleMoreInfo = useCallback((course) => {
    console.log("Showing details for course:", course.name);
    setSelectedCourse(course);
    setShowDetails(true);
  }, []);

  const handleApply = useCallback(() => {
    console.log("Opening apply form for course:", selectedCourse?.name);
    setShowDetails(false);
    setShowApplyForm(true);
  }, [selectedCourse]);

  const handleFormChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedCourse) return;

    console.log(
      "Submitting application for course:",
      selectedCourse.name,
      formData
    );
    try {
      const response = await fetch(`${API_URL}/user_inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourse.id,
          user_id: "some-user-id", // Replace with actual user ID from Clerk
          ...formData,
        }),
      });
      if (response.ok) {
        alert("Application submitted successfully!");
        setShowApplyForm(false);
        setFormData({
          name: "",
          phonenumber: "",
          address: "",
          birthday: "",
          thailanguage: false,
          gender: false,
        });
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("An error occurred. Please try again.");
    }
  }, [selectedCourse, formData]);

  const loadCourses = useCallback(async () => {
    console.log("Loading courses");
    await fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    selectedCourse,
    showDetails,
    showApplyForm,
    formData,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    handleMoreInfo,
    handleApply,
    handleFormChange,
    handleSubmit,
    loadCourses,
    setShowDetails,
    setShowApplyForm,
  };
};
