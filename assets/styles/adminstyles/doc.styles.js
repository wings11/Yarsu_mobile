import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");
const cardMargin = 8;
const containerPadding = 10;
const maxCardWidth = 392;
const minCardWidth = 300;

const calculateCardWidth = () => {
  const availableWidth = width - 2 * containerPadding;
  if (availableWidth >= 768) {
    return Math.min(maxCardWidth, (availableWidth - 2 * cardMargin) / 3);
  } else {
    return Math.min(maxCardWidth, availableWidth);
  }
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: containerPadding,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    width: calculateCardWidth(),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(44, 44, 44, 0.30)",
    backgroundColor: "rgba(248, 249, 250, 0.80)",
    margin: cardMargin,
    padding: 15,
    alignSelf: "center",
  },
  imageContainer: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageBackground: {
    width: calculateCardWidth() - 30 - 50, // Subtract padding and arrow widths
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  innerImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    paddingHorizontal: 10,
    marginTop: 5,
    gap: 5,
    marginHorizontal: "auto",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#000",
  },
  arrow: {
    fontSize: 25,
    color: "#000000",
    paddingHorizontal: 5,
  },
  detailsContainer: {
    flex: 1,
  },
  noteDropdownContainer: {
    marginVertical: 10,
  },
  noteTextBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    width: "100%",
  },
  noteTextContainer: {
    overflow: "hidden",
    flex: 1,
  },
  collapsedNoteText: {
    maxHeight: 60,
  },
  dropdownArrow: {
    marginLeft: 10,
  },
  value: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  button: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 80,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  mediaPreviewWrapper: {
    position: "relative",
    margin: 5,
  },
  imageInput: {
    width: 90,
    height: 90,
    borderColor: COLORS.black,
    borderWidth: 1,
    borderBottomWidth: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "rgba(217, 217, 217, 0.70)",
  },
  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: 10,
    resizeMode: "cover",
  },
  previewVideoText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 4,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  deleteButton: {
    backgroundColor: COLORS.background,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
