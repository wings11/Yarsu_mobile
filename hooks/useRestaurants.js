import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
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

  const fetchRestaurants = useCallback(async () => {
    console.log("Fetching restaurants from:", `${API_URL}/restaurants`);
    try {
      const response = await fetch(`${API_URL}/restaurants`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Restaurants data:", data);
      setRestaurants(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching restaurants:", error.message);
      } else {
        console.error("Error fetching restaurants:", error);
      }
    }
  }, []);

  const createRestaurant = useCallback(async (restaurantData) => {
    console.log("Creating restaurant:", restaurantData);
    try {
      const response = await fetch(`${API_URL}/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurantData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newRestaurant = await response.json();
      setRestaurants((prev) => [...prev, newRestaurant]);
      return newRestaurant;
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  }, []);

  const updateRestaurant = useCallback(async (id, restaurantData) => {
    console.log("Updating restaurant:", id, restaurantData);
    try {
      const response = await fetch(`${API_URL}/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurantData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const updatedRestaurant = await response.json();
      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant.id === id ? updatedRestaurant : restaurant
        )
      );
      return updatedRestaurant;
    } catch (error) {
      console.error("Error updating restaurant:", error);
      throw error;
    }
  }, []);

  const deleteRestaurant = useCallback(async (id) => {
    console.log("Deleting restaurant:", id);
    try {
      const response = await fetch(`${API_URL}/restaurants/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setRestaurants((prev) =>
        prev.filter((restaurant) => restaurant.id !== id)
      );
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      throw error;
    }
  }, []);

  const handleMoreInfo = useCallback((restaurant) => {
    console.log("Showing details for restaurant:", restaurant.name);
    setSelectedRestaurant(restaurant);
    setShowDetails(true);
  }, []);

  const handleApply = useCallback(() => {
    console.log("Opening apply form for restaurant:", selectedRestaurant?.name);
    setShowDetails(false);
    setShowApplyForm(true);
  }, [selectedRestaurant]);

  const handleFormChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedRestaurant) return;

    console.log(
      "Submitting application for restaurant:",
      selectedRestaurant.name,
      formData
    );
    try {
      const response = await fetch(`${API_URL}/user_inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: selectedRestaurant.id,
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
  }, [selectedRestaurant, formData]);

  const loadRestaurants = useCallback(async () => {
    console.log("Loading restaurants");
    await fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    selectedRestaurant,
    showDetails,
    showApplyForm,
    formData,
    fetchRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    handleMoreInfo,
    handleApply,
    handleFormChange,
    handleSubmit,
    loadRestaurants,
    setShowDetails,
    setShowApplyForm,
  };
};
