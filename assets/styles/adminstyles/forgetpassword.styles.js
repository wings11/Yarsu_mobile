import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import { Dimensions } from "react-native";
const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width > 600 ? "45%" : "90%", // 45% width on large screens, 90% on small
    maxWidth: 500, // Cap width for larger screens
    minWidth: 300,
    height: 330,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  label: {
    width: 150,
    fontSize: 16,
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 160,
    width: "auto",
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: COLORS.white,
  },
  eyeButton: {
    padding: 10,
  },
  saveButton: {
    minWidth: 150,
    width: "auto",
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
