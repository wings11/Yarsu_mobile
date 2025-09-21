import { useState, useCallback } from "react";
import { supabase } from '../libs/supabase';
import { decode as atob } from 'base-64';
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

  // Helper: upload base64 image or video to Supabase 'images' bucket and return public URL
  const uploadMediaToSupabase = async (base64, filename, type = 'image') => {
    // Remove data:image/...;base64, or data:video/...;base64, prefix
    let base64Data = base64;
    let contentType = 'image/jpeg';
    if (type === 'image') {
      base64Data = base64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      contentType = `image/${filename.split('.').pop() || 'jpeg'}`;
    } else if (type === 'video') {
      base64Data = base64.replace(/^data:video\/(mp4|mov|webm|ogg);base64,/, "");
      contentType = `video/${filename.split('.').pop() || 'mp4'}`;
    }
    // Decode base64 to binary string
    const binaryString = atob(base64Data);
    // Convert binary string to Uint8Array
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    const fileExt = filename.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
    const path = `images/${Date.now()}-${Math.floor(Math.random()*10000)}.${fileExt}`;
    const { error } = await supabase.storage.from('images').upload(path, byteArray, {
      contentType,
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const addJob = useCallback(async (newJob) => {
    try {
      // Process media: upload base64 images/videos to 'images' bucket, keep URLs
      let mediaUrls = [];
      if (Array.isArray(newJob.media)) {
        for (let i = 0; i < newJob.media.length; i++) {
          const item = newJob.media[i];
          if (typeof item === 'string' && item.startsWith('data:image')) {
            // Image
            const ext = item.substring(item.indexOf('/')+1, item.indexOf(';')) || 'jpg';
            const filename = `jobimg_${Date.now()}_${i}.${ext}`;
            try {
              const url = await uploadMediaToSupabase(item, filename, 'image');
              mediaUrls.push(url);
            } catch (err) {
              console.error('Image upload failed:', err.message);
            }
          } else if (typeof item === 'string' && item.startsWith('data:video')) {
            // Video
            const ext = item.substring(item.indexOf('/')+1, item.indexOf(';')) || 'mp4';
            const filename = `jobvid_${Date.now()}_${i}.${ext}`;
            try {
              const url = await uploadMediaToSupabase(item, filename, 'video');
              mediaUrls.push(url);
            } catch (err) {
              console.error('Video upload failed:', err.message);
            }
          } else if (typeof item === 'string') {
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
