import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useLinks = () => {
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchLinks = useCallback(async () => {
    console.log(`Fetching links from: ${API_URL}/links`); // Fixed: Use backticks for template literal
    try {
      const response = await fetch(`${API_URL}/links`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Links data:", data);
      setLinks(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching links:", error.message);
      } else {
        console.error("Error fetching links:", error);
      }
    }
  }, []);

  const fetchLinkById = useCallback(async (id) => {
    console.log("Fetching link by ID:", id);
    try {
      const response = await fetch(`${API_URL}/links/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Link data:", data);
      setSelectedLink(data);
      setShowDetails(true);
      return data;
    } catch (error) {
      console.error("Error fetching link:", error);
      throw error;
    }
  }, []);

  const createLink = useCallback(async (linkData) => {
    console.log("Creating link:", linkData);
    try {
      const response = await fetch(`${API_URL}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(linkData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newLink = await response.json();
      setLinks((prev) => [...prev, newLink]);
      return newLink;
    } catch (error) {
      console.error("Error creating link:", error);
      throw error;
    }
  }, []);

  const updateLink = useCallback(async (id, linkData) => {
    console.log("Updating link:", id, linkData);
    try {
      const response = await fetch(`${API_URL}/links/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(linkData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const updatedLink = await response.json();
      setLinks((prev) =>
        prev.map((link) => (link.id === id ? updatedLink : link))
      );
      return updatedLink;
    } catch (error) {
      console.error("Error updating link:", error);
      throw error;
    }
  }, []);

  const deleteLink = useCallback(async (id) => {
    console.log("Deleting link:", id);
    try {
      const response = await fetch(`${API_URL}/links/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (error) {
      console.error("Error deleting link:", error);
      throw error;
    }
  }, []);

  const handleMoreInfo = useCallback((link) => {
    console.log("Showing details for link:", link.platform);
    setSelectedLink(link);
    setShowDetails(true);
  }, []);

  const loadLinks = useCallback(async () => {
    console.log("Loading links");
    await fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    selectedLink,
    showDetails,
    fetchLinks,
    fetchLinkById,
    createLink,
    updateLink,
    deleteLink,
    handleMoreInfo,
    loadLinks,
    setShowDetails,
  };
};
