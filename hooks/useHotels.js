import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

// Optional: Replace with your actual auth token if required
const AUTH_TOKEN = process.env.REACT_APP_API_TOKEN || ""; // Define in .env file

export const useHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHotels = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/hotels`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setHotels(data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  }, []);

  const fetchHotelDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/hotels/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedHotel(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    }
  }, []);

  const addHotel = useCallback(async (hotelData) => {
    try {
      const response = await fetch(`${API_URL}/hotels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }), // Add token if required
        },
        body: JSON.stringify(hotelData),
      });
      if (!response.ok) {
        const errorText = await response.text(); // Log response body for details
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newHotel = await response.json();
      setHotels((prevHotels) => [...prevHotels, newHotel]);
      return newHotel;
    } catch (error) {
      console.error("Error creating hotel:", error);
      throw error;
    }
  }, []);

  const updateHotel = useCallback(
    async (id, hotelData) => {
      try {
        const response = await fetch(`${API_URL}/hotels/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
          body: JSON.stringify(hotelData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedHotel = await response.json();
        setHotels((prevHotels) =>
          prevHotels.map((hotel) => (hotel.id === id ? updatedHotel : hotel))
        );
        if (selectedHotel?.id === id) {
          setSelectedHotel(updatedHotel);
        }
        return updatedHotel;
      } catch (error) {
        console.error("Error updating hotel:", error);
        throw error;
      }
    },
    [selectedHotel]
  );

  const deleteHotel = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/hotels/${id}`, {
          method: "DELETE",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setHotels((prevHotels) =>
          prevHotels.filter((hotel) => hotel.id !== id)
        );
        if (selectedHotel?.id === id) {
          setSelectedHotel(null);
          setShowDetails(false);
        }
      } catch (error) {
        console.error("Error deleting hotel:", error);
        throw error;
      }
    },
    [selectedHotel]
  );

  const handleMoreInfo = useCallback(
    (hotel) => {
      fetchHotelDetails(hotel.id);
    },
    [fetchHotelDetails]
  );

  const loadHotels = useCallback(async () => {
    await fetchHotels();
  }, [fetchHotels]);

  return {
    hotels,
    selectedHotel,
    showDetails,
    fetchHotels,
    fetchHotelDetails,
    addHotel,
    updateHotel,
    deleteHotel,
    handleMoreInfo,
    loadHotels,
    setShowDetails,
  };
};
