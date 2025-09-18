import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { styles } from "@/assets/styles/adminstyles/job.styles";
import { useJobs } from "@/hooks/useJobs";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

// Define the Job type - updated to match backend
type JobType = {
  id: number;
  title: string;
  job_location: string;
  location?: string;
  created_at: string;
  notes?: string;
  pinkcard?: boolean;
  thai?: boolean;
  provide_stay?: boolean; // Changed from stay to provide_stay
  job_num?: string;
  media?: string | string[]; // Can be string or array
  job_date?: string;
  payment?: string; // Payment type (text field)
  pay_amount?: string | number; // Pay amount (text field)
  accept_amount?: number;
  accept?: string;
  treat?: boolean;
  stayplace?: string; // New field for stay place when provide_stay is true
};

// Define type for edited values to allow string for boolean fields during editing
type EditedJobType = Partial<{
  title: string;
  job_location: string;
  location: string;
  notes: string;
  pinkcard: string | boolean;
  thai: string | boolean;
  provide_stay: string | boolean; // Changed from stay to provide_stay
  job_num: string;
  media: string;
  job_date: string;
  payment: string;
  pay_amount: string;
  accept_amount: string;
  accept: string;
  treat: string | boolean;
  stayplace: string; // New field for stay place
}>;

const AdminJob = () => {
  const { language } = useLanguage();
  const {
    jobs: fetchedJobs,
    loadJobs,
    editJob,
    deleteJob,
  } = useJobs() as {
    jobs: JobType[];
    loadJobs: () => void;
    editJob: (id: number, updatedJob: Partial<JobType>) => void;
    deleteJob: (id: number) => void;
  };
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedJobType;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );
  const [numColumns, setNumColumns] = useState(2); // Default to 2 columns

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      console.log(
        `AdminJob - Window width: ${width}, Num columns: ${numColumns}`
      );
      setNumColumns(width >= 768 ? 2 : 1); // 2 columns for wide screens, 1 for narrow
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, [numColumns]);

  useEffect(() => {
    loadJobs();
    setJobs(fetchedJobs);
  }, [loadJobs, fetchedJobs]);

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = (id: number) => {
    const updatedJob = editedValues[id] || {};
    const convertedJob: Partial<JobType> = {};

    // Convert string inputs to appropriate types
    if (updatedJob.title) {
      convertedJob.title = updatedJob.title;
    }
    if (updatedJob.job_location) {
      convertedJob.job_location = updatedJob.job_location;
    }
    if (updatedJob.notes !== undefined) {
      convertedJob.notes = updatedJob.notes;
    }
    if (updatedJob.pinkcard !== undefined) {
      const lowerValue =
        typeof updatedJob.pinkcard === "string"
          ? updatedJob.pinkcard.toLowerCase()
          : updatedJob.pinkcard;
      if (lowerValue === "yes") {
        convertedJob.pinkcard = true;
      } else if (lowerValue === "no") {
        convertedJob.pinkcard = false;
      }
    }
    if (updatedJob.thai !== undefined) {
      const lowerValue =
        typeof updatedJob.thai === "string"
          ? updatedJob.thai.toLowerCase()
          : updatedJob.thai;
      if (lowerValue === "yes") {
        convertedJob.thai = true;
      } else if (lowerValue === "no") {
        convertedJob.thai = false;
      }
    }
    if (updatedJob.provide_stay !== undefined) {
      const lowerValue =
        typeof updatedJob.provide_stay === "string"
          ? updatedJob.provide_stay.toLowerCase()
          : updatedJob.provide_stay;
      if (lowerValue === "yes") {
        convertedJob.provide_stay = true;
      } else if (lowerValue === "no") {
        convertedJob.provide_stay = false;
      }
    }
    if (updatedJob.stayplace !== undefined) {
      convertedJob.stayplace = updatedJob.stayplace as string;
    }
    if (updatedJob.accept !== undefined) {
      convertedJob.accept = updatedJob.accept as string;
    }
    if (updatedJob.treat !== undefined) {
      const lowerValue =
        typeof updatedJob.treat === "string"
          ? updatedJob.treat.toLowerCase()
          : updatedJob.treat;
      if (lowerValue === "yes") {
        convertedJob.treat = true;
      } else if (lowerValue === "no") {
        convertedJob.treat = false;
      }
    }
    if (updatedJob.pay_amount !== undefined) {
      // Pay amount can now be text or number, so keep as string
      convertedJob.pay_amount = updatedJob.pay_amount as string;
    }
    if (updatedJob.accept_amount !== undefined) {
      convertedJob.accept_amount = parseFloat(updatedJob.accept_amount as string) || 0;
    }

    if (Object.keys(convertedJob).length > 0) {
      editJob(id, convertedJob);
      setEditMode({ ...editMode, [id]: false });
      setEditedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
      Alert.alert(
        "Saved",
        labels[language].save || "Changes have been saved!"
      );
    } else {
      setEditMode({ ...editMode, [id]: false });
    }
  };

  const handleConfirmDelete = (id: number) => {
    deleteJob(id);
    setDeleteModalVisible(null);
    setJobs(jobs.filter((job) => job.id !== id));
    Alert.alert("Deleted", labels[language].delete || "Job has been deleted!");
  };

  const renderItem = ({ item }: { item: JobType }) => (
    <View style={styles.card}>
      <View style={styles.detailsContainer}>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Job Date:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.job_date || item.job_date || ""}
              onChangeText={(text) => handleEdit(item.id, "job_date", text)}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <Text style={styles.value}>{item.job_date || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Job Num:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.job_num || item.job_num || ""}
              onChangeText={(text) => handleEdit(item.id, "job_num", text)}
              placeholder="Enter job number"
            />
          ) : (
            <Text style={styles.value}>{item.job_num || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].title}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.title || item.title}
              onChangeText={(text) => handleEdit(item.id, "title", text)}
            />
          ) : (
            <Text style={styles.value}>{item.title}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Job Location:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.job_location || item.job_location}
              onChangeText={(text) => handleEdit(item.id, "job_location", text)}
            />
          ) : (
            <Text style={styles.value}>{item.job_location}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Payment Type:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.payment || item.payment || ""}
              onChangeText={(text) => handleEdit(item.id, "payment", text)}
              placeholder="Enter payment type"
            />
          ) : (
            <Text style={styles.value}>{item.payment || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Pay Amount:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.pay_amount !== undefined ? String(editedValues[item.id].pay_amount) : item.pay_amount ? String(item.pay_amount) : ""}
              onChangeText={(text) => handleEdit(item.id, "pay_amount", text)}
              placeholder="Enter pay amount (text or number)"
            />
          ) : (
            <Text style={styles.value}>{item.pay_amount || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Accept Amount:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.accept_amount !== undefined ? String(editedValues[item.id].accept_amount) : item.accept_amount ? String(item.accept_amount) : ""}
              onChangeText={(text) => handleEdit(item.id, "accept_amount", text)}
              placeholder="Enter accept amount"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>{item.accept_amount || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Accept:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.accept !== undefined
                  ? String(editedValues[item.id].accept)
                  : item.accept || ""
              }
              onChangeText={(text) => handleEdit(item.id, "accept", text)}
              placeholder="Enter accept details"
            />
          ) : (
            <Text style={styles.value}>{item.accept || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].pinkCard}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.pinkcard !== undefined
                  ? String(editedValues[item.id].pinkcard)
                  : item.pinkcard
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "pinkcard", text)}
              placeholder="Yes or No"
            />
          ) : (
            <Text style={styles.value}>{item.pinkcard ? "Yes" : "No"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].thai}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.thai !== undefined
                  ? String(editedValues[item.id].thai)
                  : item.thai
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "thai", text)}
              placeholder="Yes or No"
            />
          ) : (
            <Text style={styles.value}>{item.thai ? "Yes" : "No"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Provide Stay:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.provide_stay !== undefined
                  ? String(editedValues[item.id].provide_stay)
                  : item.provide_stay
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "provide_stay", text)}
              placeholder="Yes or No"
            />
          ) : (
            <Text style={styles.value}>{item.provide_stay ? "Yes" : "No"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Stay Place:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.stayplace || item.stayplace || ""}
              onChangeText={(text) => handleEdit(item.id, "stayplace", text)}
              placeholder="Enter stay place (if provide_stay is true)"
            />
          ) : (
            <Text style={styles.value}>{item.stayplace || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Treat:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.treat !== undefined
                  ? String(editedValues[item.id].treat)
                  : item.treat
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "treat", text)}
              placeholder="Yes or No"
            />
          ) : (
            <Text style={styles.value}>{item.treat ? "Yes" : "No"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Media:</Text>
          {(() => {
            let mediaArray = [];
            try {
              // Handle both string and array types
              if (!item.media) {
                mediaArray = [];
              } else if (Array.isArray(item.media)) {
                mediaArray = item.media;
              } else if (typeof item.media === 'string') {
                const firstParse = JSON.parse(item.media);
                if (Array.isArray(firstParse)) {
                  mediaArray = firstParse;
                } else if (typeof firstParse === 'string') {
                  mediaArray = JSON.parse(firstParse);
                }
              }
            } catch {
              mediaArray = [];
            }
            return mediaArray.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {mediaArray.map((url: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={{ width: 50, height: 50, margin: 2 }}
                    resizeMode="cover"
                  />
                ))}
              </View>
            ) : <Text style={styles.value}>No media</Text>;
          })()}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].notes}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.notes || item.notes || ""}
              onChangeText={(text) => handleEdit(item.id, "notes", text)}
              placeholder="Enter notes"
            />
          ) : (
            <Text style={styles.value}>{item.notes || "N/A"}</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {editMode[item.id] ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSave(item.id)}
            >
              <Text style={styles.buttonText}>
                {labels[language].save || "Save"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setEditMode({ ...editMode, [item.id]: true })}
            >
              <Text style={styles.buttonText}>
                {labels[language].edit || "Edit"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDeleteModalVisible(item.id)}
          >
            <Text style={styles.buttonText}>{labels[language].delete}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={deleteModalVisible === item.id}
        onRequestClose={() => setDeleteModalVisible(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {labels[language].deleteConfirm}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setDeleteModalVisible(null)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleConfirmDelete(item.id)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].delete}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          numColumns={numColumns}
          key={`flatlist-${numColumns}`}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          ListEmptyComponent={
            <Text style={styles.title}>{labels[language].noJobs}</Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminJob;
