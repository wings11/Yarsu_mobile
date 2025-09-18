import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 28,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  card: {
    width: (width - 28 * 2 - 20 * 2) / 3, // Default for 3 columns
    minWidth: 200, // Minimum card width
    flex: 1, // Allow card to grow/shrink
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#F3F3F3",
    borderRadius: 24,
    margin: 10, // Margin for spacing
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsContainer: {
    flex: 1,
    padding: 10,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "400",
    
    letterSpacing: 0.15,
    color: COLORS.black,
    marginBottom: 5,
    width: "45%",
    minWidth: 100,
  },
  value: {
    fontFamily: "SF Pro",
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "400",
    
    letterSpacing: 0.15,
    color: COLORS.black,
    marginBottom: 15,
    width: "55%",
    minWidth: 100,
  },
  input: {
    width: "55%",
    minWidth: 100,
    height: 25,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginHorizontal: "auto",
    marginTop: 10,
  },
  button: {
    width: 77,
    height: 45,
    padding: 5,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "400",
    
    letterSpacing: 0.15,
    color: COLORS.white,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 354,
    height: 136,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "SF Pro Text",
    marginBottom: 20,
    color: COLORS.black,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    flex: 1,
    marginTop: 10,
    marginHorizontal: 30,
    borderWidth: 1,
    borderColor: COLORS.background,
    width: 74,
    height: 35,
  },
  modalButtonText: {
    fontSize: 10,
    fontWeight: "500",
    fontFamily: "SF Pro Text",
    color: COLORS.black,
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
});
