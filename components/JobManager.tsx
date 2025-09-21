import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useJobs } from '../hooks/useJobs';
import { styles } from '../assets/styles/adminstyles/AddButtonStyles';
import * as ImagePicker from 'expo-image-picker';

interface Job {
  id: number;
  job_num?: string;
  media?: string[];
  title: string;
  pinkcard: boolean;
  thai: boolean;
  payment_type?: boolean; // true = daily, false = monthly
  job_date?: string;
  payment?: string | null;
  pay_amount?: string | number | null;
  accept_amount?: string | number | null;
  treat?: boolean;
  accept?: string | null;
  stay: boolean;
  location: string;
  job_location: string;
  notes?: string;
  created_at: string;
}

const defaultFormData = {
  job_num: '',
  title: '',
  pinkcard: false,
  thai: false,
  payment_type: true, // true = daily, false = monthly
  job_date: '',
  payment: null as string | null,
  pay_amount: '' as string | number | null,
  accept_amount: '' as string | number | null,
  treat: false,
  accept: '',
  stay: false,
  location: '',
  job_location: '',
  notes: '',
  media: [] as string[],
};

export default function JobManager() {
  const { language } = useLanguage();
  const { jobs, loadJobs, addJob, updateJob, deleteJob, loading } = useJobs();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadJobs();
  }, []);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingJob(null);
    setModalVisible(false);
  };

  // Minimalist job details modal
  const handleShowDetails = (job: Job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.job_location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.stay && !formData.location.trim()) {
      Alert.alert('Error', 'Please specify accommodation location');
      return;
    }

    // Clean the data before sending - using website logic
    const cleanData = {
      job_num: formData.job_num?.trim() || '',
      title: formData.title.trim(),
      pinkcard: Boolean(formData.pinkcard),
      thai: Boolean(formData.thai),
      payment_type: formData.payment_type,
      job_date: formData.job_date ? String(formData.job_date).trim() : '',
      payment: formData.payment ? String(formData.payment).trim() : null,
      pay_amount: formData.pay_amount ? String(formData.pay_amount).trim() : null,
      accept_amount: formData.accept_amount ? Number(formData.accept_amount) : null,
      treat: Boolean(formData.treat),
      accept: formData.accept?.trim() || '',
      stay: Boolean(formData.stay),
      location: formData.stay ? formData.location.trim() : '',
      job_location: formData.job_location.trim(),
      notes: formData.notes.trim() || '',
      media: Array.isArray(formData.media) ? formData.media : [],
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, cleanData);
        Alert.alert('Success', 'Job updated successfully!');
      } else {
        await addJob(cleanData);
        Alert.alert('Success', 'Job created successfully!');
      }
      resetForm();
      loadJobs();
    } catch (error) {
      console.error('Job operation error:', error);
      Alert.alert('Error', 'Failed to save job');
    }
  };

  const handleDelete = (jobId: number) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJob(jobId);
              Alert.alert('Success', 'Job deleted successfully!');
              loadJobs();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const pickImage = async () => {
    const hasPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (hasPermission.status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64 = result.assets[0].base64;
      if (base64) {
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        updateFormData({ media: [...formData.media, dataUrl] });
      }
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    updateFormData({ media: newMedia });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Job</Text>
        </TouchableOpacity>
      </View>

      {/* Minimalist Jobs List */}
      <ScrollView style={styles.jobsList}>
        {jobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={[styles.jobCard, { padding: 16, marginBottom: 12, borderRadius: 10, backgroundColor: '#fff', elevation: 2 }]}
            onPress={() => handleShowDetails(job)}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
              {job.title}
            </Text>
            <Text style={{ color: '#888', marginBottom: 2 }}>
              {job.job_num ? `Job No: ${job.job_num}` : ''}
            </Text>
            <Text style={{ color: '#888', marginBottom: 2 }}>
              {job.job_date ? `Date: ${job.job_date}` : ''}
            </Text>
            <Text style={{ color: '#888', marginBottom: 2 }}>
              {job.job_location ? `Location: ${job.job_location}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Minimalist Job Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', minHeight: 320, backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {selectedJob && (
                <>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{selectedJob.title}</Text>
                  <Text style={{ color: '#888', marginBottom: 2 }}>{selectedJob.job_num ? `Job No: ${selectedJob.job_num}` : ''}</Text>
                  <Text style={{ color: '#888', marginBottom: 2 }}>{selectedJob.job_date ? `Date: ${selectedJob.job_date}` : ''}</Text>
                  <Text style={{ color: '#888', marginBottom: 2 }}>{selectedJob.job_location ? `Location: ${selectedJob.job_location}` : ''}</Text>
                  {selectedJob.notes ? (
                    <Text style={{ marginTop: 12, fontSize: 15, color: '#222', marginBottom: 8 }}>{selectedJob.notes}</Text>
                  ) : null}
                  {/* Minimalist: show only main content above, media below */}
                  {selectedJob.media && selectedJob.media.length > 0 && (
                    <View style={{ marginTop: 18 }}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Media</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                        {selectedJob.media.map((uri, idx) => (
                          uri.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <Image key={idx} source={{ uri }} style={{ width: 120, height: 120, borderRadius: 10, marginRight: 10, backgroundColor: '#eee' }} />
                          ) : uri.match(/\.(mp4|mov|webm|ogg)$/i) ? (
                            <View key={idx} style={{ width: 120, height: 120, borderRadius: 10, marginRight: 10, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ fontSize: 12, color: '#666' }}>Video</Text>
                              {/* You can use expo-av Video here for actual playback */}
                            </View>
                          ) : null
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}
              <TouchableOpacity style={{ marginTop: 18, alignSelf: 'center' }} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
