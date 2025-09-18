import { useState, useCallback } from "react";
import { supabase } from '../libs/supabase';
import { decode as atob } from 'base-64';
import RNBlobUtil from 'react-native-blob-util';
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useJobs = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
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

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error.message);
    }
  }, []);

  const handleMoreInfo = useCallback((job) => {
    setSelectedJob(job);
    setShowDetails(true);
  }, []);

  const handleApply = useCallback(() => {
    setShowDetails(false);
    setShowApplyForm(true);
  }, [selectedJob]);

  const handleFormChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedJob) return;

    const userId = await SecureStore.getItemAsync("userId");
    if (!userId) {
      alert("Please log in to apply.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: selectedJob.id,
          user_id: userId,
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
        // Redirect to chat screen (assuming chatId is created or linked by backend)

        router.replace("/ChatScreen");
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("An error occurred. Please try again.");
    }
  }, [selectedJob, formData, router]);

  const loadJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  const editJob = useCallback(async (id, updatedJob) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedJob),
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const updatedData = await response.json();
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === id ? updatedData : job))
      );
    } catch (error) {
      console.error("Error editing job:", error.message);
      alert("An error occurred while editing the job.");
    }
  }, []);

  const deleteJob = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error("Error deleting job:", error.message);
      alert("An error occurred while deleting the job.");
    }
  }, []);

  // Helper: upload image or video file to Supabase 'images' bucket using react-native-blob-util
  const uploadMediaToSupabase = async (fileUri, filename, type = 'image') => {
    // fileUri: local file URI from picker
    const fileExt = filename.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
    const contentType = type === 'image' ? `image/${fileExt}` : `video/${fileExt}`;
    const path = `images/${Date.now()}-${Math.floor(Math.random()*10000)}.${fileExt}`;
    // Supabase Storage REST API endpoint
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/images/${path}`;
    // Upload file using RNBlobUtil
    const res = await RNBlobUtil.fetch('POST', uploadUrl, {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    }, RNBlobUtil.wrap(fileUri));
    if (res.info().status !== 200 && res.info().status !== 201) {
      throw new Error('Upload failed: ' + res.info().status);
    }
    // Get public URL
    return `${supabaseUrl}/storage/v1/object/public/images/${path}`;
  };

  const addJob = useCallback(async (newJob) => {
    try {
      // Process media: upload images/videos using file URI, keep URLs
      let mediaUrls = [];
      if (Array.isArray(newJob.media)) {
        for (let i = 0; i < newJob.media.length; i++) {
          const item = newJob.media[i];
          // If item is a local file URI (starts with file://), upload
          if (typeof item === 'string' && item.startsWith('file://')) {
            // Guess type by extension
            const ext = item.split('.').pop().toLowerCase();
            const isImage = ['jpg','jpeg','png','webp'].includes(ext);
            const isVideo = ['mp4','mov','webm','ogg'].includes(ext);
            const filename = `jobmedia_${Date.now()}_${i}.${ext}`;
            try {
              const url = await uploadMediaToSupabase(item, filename, isImage ? 'image' : (isVideo ? 'video' : 'image'));
              mediaUrls.push(url);
            } catch (err) {
              console.error('Media upload failed:', err.message);
            }
          } else if (typeof item === 'string') {
            // Already a URL or base64 string, just push
            mediaUrls.push(item);
          }
        }
      }

      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Strictly match jobs schema types
          title: newJob.title || '',
          pinkcard: typeof newJob.pinkcard === 'boolean' ? newJob.pinkcard : false,
          thai: typeof newJob.thai === 'boolean' ? newJob.thai : false,
          payment_type: typeof newJob.payment_type === 'boolean' ? newJob.payment_type : null,
          stay: typeof newJob.stay === 'boolean' ? newJob.stay : false,
          location: newJob.location || null,
          job_location: newJob.job_location || '',
          notes: newJob.notes || null,
          job_num: newJob.job_num || null,
          media: mediaUrls,
          job_date: newJob.job_date || null,
          payment: newJob.payment || null,
          pay_amount: newJob.pay_amount || null,
          accept_amount: newJob.accept_amount || null,
          treat: typeof newJob.treat === 'boolean' ? newJob.treat : false,
          accept: newJob.accept || null,
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const addedJob = await response.json();
      setJobs((prevJobs) => [...prevJobs, addedJob]);
      alert("Job added successfully!");
    } catch (error) {
      console.error("Error adding job:", error.message);
      alert("An error occurred while adding the job.");
    }
  }, []);

  return {
    jobs,
    selectedJob,
    showDetails,
    showApplyForm,
    formData,
    fetchJobs,
    handleMoreInfo,
    handleApply,
    handleFormChange,
    handleSubmit,
    loadJobs,
    setShowDetails,
    setShowApplyForm,
    editJob,
    deleteJob,
    addJob,
  };
};
