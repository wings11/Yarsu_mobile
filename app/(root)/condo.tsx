import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useCondos } from "@/hooks/useCondos";
import { styles } from "@/assets/styles/condo.styles";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

type CondoType = {
  id: number;
  name: string;
  address: string;
  rent_fee: number;
  images: string[];
  swimming_pool: boolean;
  free_wifi: boolean;
  gym: boolean;
  garden: boolean;
  co_working_space: boolean;
  created_at: string;
  notes?: string;
};

const Condo = () => {
  const { language } = useLanguage();
  const { condos, loadCondos } = useCondos();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string | undefined>("");
  const [expandedNotes, setExpandedNotes] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    loadCondos();
    console.log("Condo data:", condos);
  }, [loadCondos]);

  const openNotesModal = (notes: string | undefined) => {
    setSelectedNotes(notes || "No notes available");
    setModalVisible(true);
  };

  const toggleNoteExpanded = (id: number) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderItem = ({ item }: { item: CondoType }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {item.images && item.images[0] && (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.cardImage}
            onError={(error) =>
              console.error("Image load error:", error.nativeEvent)
            }
          />
        )}
        <View style={styles.detailsContainer}>
          {item.name && <Text style={styles.overlayText}>{item.name}</Text>}
          {item.rent_fee !== undefined && (
            <Text style={styles.modalText}>
              <Image
                style={styles.amenityIcon}
                source={require("@/assets/images/money_icon.png")}
              />{" "}
              THB {item.rent_fee}/ month
            </Text>
          )}
          {item.address && (
            <Text style={styles.modalText}>📍 {item.address}</Text>
          )}
          <View style={styles.amenitiesContainer}>
            {item.swimming_pool && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🏊 Swimming Pool</Text>
              </View>
            )}
            {item.free_wifi && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🛜 Free Wi-Fi</Text>
              </View>
            )}
            {item.gym && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🏋️ Gym</Text>
              </View>
            )}
            {item.garden && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🌿 Garden</Text>
              </View>
            )}
            {item.co_working_space && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>📚 Co-working Space</Text>
              </View>
            )}
          </View>
          {item.notes && (
            <View style={styles.noteDropdownContainer}>
              <TouchableOpacity
                style={styles.noteTextBox}
                onPress={() => toggleNoteExpanded(item.id)}
              >
                <View
                  style={[
                    styles.noteTextContainer,
                    !expandedNotes[item.id] && styles.collapsedNoteText,
                  ]}
                >
                  <Text style={styles.modalText}>
                    {item.notes || "No additional notes available"}
                  </Text>
                </View>
                <Ionicons
                  name={expandedNotes[item.id] ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.black}
                  style={styles.dropdownArrow}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View style={styles.imageOverlay}></View>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.cardTitle}>
            <Text style={styles.cardTitleText1}>
              {labels[language].citylife || "City Life"}
            </Text>
            <Text style={styles.cardTitleText2}>
              {labels[language].Simplified || "Simplified."}
            </Text>
          </View>
          {condos.length === 0 ? (
            <Text style={styles.title}>Loading condos...</Text>
          ) : (
            <FlatList
              data={condos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              horizontal={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContainer}
              ListEmptyComponent={<Text>No condos available</Text>}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default Condo;
