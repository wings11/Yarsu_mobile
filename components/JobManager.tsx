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
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadJobs();
  }, []);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingJob(null);
    setModalVisible(false);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      job_num: job.job_num || '',
      title: job.title,
      pinkcard: job.pinkcard,
      thai: job.thai,
      payment_type: job.payment_type ?? true,
      job_date: job.job_date || '',
      payment: job.payment ?? null,
      pay_amount: job.pay_amount ?? '',
      accept_amount: job.accept_amount ?? '',
      treat: Boolean(job.treat),
      accept: job.accept ?? '',
      stay: job.stay,
      location: job.location,
      job_location: job.job_location,
      notes: job.notes || '',
      media: job.media || [],
    });
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

      {/* Jobs List */}
      <ScrollView style={styles.jobsList}>
        {jobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>
                {job.job_num ? `[${job.job_num}] ` : ''}{job.title}
              </Text>
              <View style={styles.jobActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(job)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(job.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.jobLocation}>📍 {job.job_location}</Text>
            {job.notes && <Text style={styles.jobNotes}>{job.notes}</Text>}
            
            <View style={styles.jobDetails}>
              {job.pay_amount && <Text>💰 {job.pay_amount} ฿</Text>}
              {job.accept_amount && <Text>👥 {job.accept_amount} people</Text>}
              {job.job_date && <Text>📅 {new Date(job.job_date).toLocaleDateString()}</Text>}
            </View>

            <View style={styles.jobTags}>
              {job.pinkcard && <Text style={styles.tag}>Pink Card</Text>}
              {job.thai && <Text style={styles.tag}>Thai</Text>}
              {job.stay && <Text style={styles.tag}>Stay</Text>}
              {job.treat && <Text style={styles.tag}>Treat</Text>}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Job Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalBodyContent}>
              <Text style={styles.modalTitle}>
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </Text>

              {/* Job Number and Date */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Job Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.job_num}
                    onChangeText={(text) => updateFormData({ job_num: text })}
                    placeholder="Optional"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Job Date</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.job_date}
                    onChangeText={(text) => updateFormData({ job_date: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              {/* Title */}
              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => updateFormData({ title: text })}
                placeholder="Enter job title"
              />

              {/* Job Location */}
              <Text style={styles.label}>Job Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.job_location}
                onChangeText={(text) => updateFormData({ job_location: text })}
                placeholder="Specific work location"
              />

              {/* Payment Details */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Payment Type</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.payment || ''}
                    onChangeText={(text) => updateFormData({ payment: text })}
                    placeholder="Daily, Monthly, etc."
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Pay Amount (Baht)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.pay_amount || '')}
                    onChangeText={(text) => updateFormData({ pay_amount: text })}
                    placeholder="500-1000"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Accept Amount and Accept Text */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Number of Workers</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.accept_amount || '')}
                    onChangeText={(text) => updateFormData({ accept_amount: text })}
                    placeholder="Number of people"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Accept</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.accept}
                    onChangeText={(text) => updateFormData({ accept: text })}
                    placeholder="Couples welcome, etc."
                  />
                </View>
              </View>

              {/* Checkboxes */}
              <View style={styles.checkboxContainer}>
                <View style={styles.checkboxRow}>
                  <Switch
                    value={formData.pinkcard}
                    onValueChange={(value) => updateFormData({ pinkcard: value })}
                  />
                  <Text style={styles.checkboxLabel}>Pink Card Required</Text>
                </View>

                <View style={styles.checkboxRow}>
                  <Switch
                    value={formData.thai}
                    onValueChange={(value) => updateFormData({ thai: value })}
                  />
                  <Text style={styles.checkboxLabel}>Thai Language</Text>
                </View>

                <View style={styles.checkboxRow}>
                  <Switch
                    value={formData.stay}
                    onValueChange={(value) => updateFormData({ stay: value })}
                  />
                  <Text style={styles.checkboxLabel}>Accommodation Provided</Text>
                </View>

                <View style={styles.checkboxRow}>
                  <Switch
                    value={formData.treat}
                    onValueChange={(value) => updateFormData({ treat: value })}
                  />
                  <Text style={styles.checkboxLabel}>Meals Provided</Text>
                </View>
              </View>

              {/* Location if stay is true */}
              {formData.stay && (
                <>
                  <Text style={styles.label}>Accommodation Location *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(text) => updateFormData({ location: text })}
                    placeholder="Accommodation address"
                  />
                </>
              )}

              {/* Notes */}
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => updateFormData({ notes: text })}
                placeholder="Additional information"
                multiline
                numberOfLines={3}
              />

              {/* Media */}
              <Text style={styles.label}>Media</Text>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <Text style={styles.mediaButtonText}>Add Image/Video</Text>
              </TouchableOpacity>

              {formData.media.length > 0 && (
                <ScrollView horizontal style={styles.mediaPreview}>
                  {formData.media.map((uri, index) => (
                    <View key={index} style={styles.mediaItem}>
                      <Image source={{ uri }} style={styles.mediaImage} />
                      <TouchableOpacity
                        style={styles.removeMediaButton}
                        onPress={() => removeMedia(index)}
                      >
                        <Text style={styles.removeMediaText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                  <Text style={styles.saveButtonText}>
                    {editingJob ? 'Update' : 'Save'} Job
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
