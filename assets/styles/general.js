import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import { Dimensions } from "react-native";

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
    padding: 10,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(44, 44, 44, 0.30)",
    backgroundColor: "rgba(248, 249, 250, 0.80)",
    margin: 8,
    padding: 15,
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
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 5,
    gap: 5,
    position: "absolute",
    bottom: -20,
    margin: "auto",
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
  },
  detailsContainer: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.black,
    width: 100,
  },
  value: {
    fontSize: 16,
    color: COLORS.black,
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
});
