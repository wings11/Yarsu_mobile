import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

// Optional: Replace with your actual auth token if required
const AUTH_TOKEN = process.env.REACT_APP_API_TOKEN || ""; // Define in .env file

export const useCondos = () => {
  const [condos, setCondos] = useState([]);
  const [selectedCondo, setSelectedCondo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchCondos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/condos`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setCondos(data);
    } catch (error) {
      console.error("Error fetching condos:", error);
    }
  }, []);

  const fetchCondoDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/condos/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedCondo(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching condo details:", error);
    }
  }, []);

  const addCondo = useCallback(async (condoData) => {
    try {
      const response = await fetch(`${API_URL}/condos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
        body: JSON.stringify(condoData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newCondo = await response.json();
      setCondos((prevCondos) => [...prevCondos, newCondo]);
      return newCondo;
    } catch (error) {
      console.error("Error adding condo:", error);
      throw error;
    }
  }, []);

  const editCondo = useCallback(
    async (id, condoData) => {
      try {
        const response = await fetch(`${API_URL}/condos/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
          body: JSON.stringify(condoData),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedCondo = await response.json();
        setCondos((prevCondos) =>
          prevCondos.map((condo) => (condo.id === id ? updatedCondo : condo))
        );
        if (selectedCondo?.id === id) {
          setSelectedCondo(updatedCondo);
        }
        return updatedCondo;
      } catch (error) {
        console.error("Error updating condo:", error);
        throw error;
      }
    },
    [selectedCondo]
  );

  const deleteCondo = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/condos/${id}`, {
          method: "DELETE",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setCondos((prevCondos) =>
          prevCondos.filter((condo) => condo.id !== id)
        );
        if (selectedCondo?.id === id) {
          setSelectedCondo(null);
          setShowDetails(false);
        }
      } catch (error) {
        console.error("Error deleting condo:", error);
        throw error;
      }
    },
    [selectedCondo]
  );

  const handleMoreInfo = useCallback(
    (condo) => {
      fetchCondoDetails(condo.id);
    },
    [fetchCondoDetails]
  );

  const loadCondos = useCallback(async () => {
    await fetchCondos();
  }, [fetchCondos]);

  return {
    condos,
    selectedCondo,
    showDetails,
    fetchCondos,
    fetchCondoDetails,
    addCondo,
    editCondo,
    deleteCondo,
    handleMoreInfo,
    loadCondos,
    setShowDetails,
  };
};
