import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";
const AUTH_TOKEN = process.env.REACT_APP_API_TOKEN || "";

export const useDocs = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/docs`, {
        headers: {
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching docs posts:", error);
    }
  }, []);

  const fetchPostDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/docs/${id}`, {
        headers: {
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedPost(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching docs post details:", error);
    }
  }, []);

  const addPost = useCallback(async (postData) => {
    try {
      const response = await fetch(`${API_URL}/docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newPost = await response.json();
      setPosts((prevPosts) => [...prevPosts, newPost]);
      return newPost;
    } catch (error) {
      console.error("Error creating docs post:", error);
      throw error;
    }
  }, []);

  const updatePost = useCallback(
    async (id, postData) => {
      try {
        const response = await fetch(`${API_URL}/docs/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
          body: JSON.stringify(postData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === id ? updatedPost : post))
        );
        if (selectedPost?.id === id) {
          setSelectedPost(updatedPost);
        }
        return updatedPost;
      } catch (error) {
        console.error("Error updating docs post:", error);
        throw error;
      }
    },
    [selectedPost]
  );

  const deletePost = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/docs/${id}`, {
          method: "DELETE",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
        if (selectedPost?.id === id) {
          setSelectedPost(null);
          setShowDetails(false);
        }
      } catch (error) {
        console.error("Error deleting docs post:", error);
        throw error;
      }
    },
    [selectedPost]
  );

  const handleMoreInfo = useCallback(
    (post) => {
      fetchPostDetails(post.id);
    },
    [fetchPostDetails]
  );

  const loadPosts = useCallback(async () => {
    await fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    selectedPost,
    showDetails,
    fetchPosts,
    fetchPostDetails,
    addPost,
    updatePost,
    deletePost,
    handleMoreInfo,
    loadPosts,
    setShowDetails,
  };
};
