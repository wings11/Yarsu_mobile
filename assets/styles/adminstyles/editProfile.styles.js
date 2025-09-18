import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import { Dimensions } from "react-native";
const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  contentContainer: {
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.background,
    width: width > 600 ? "45%" : "90%", // 45% width on large screens, 90% on small
    maxWidth: 500, // Cap width for larger screens
    minWidth: 300,
    height: "auto",
    borderRadius: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: " rgba(248, 249, 250, 0.50)",
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45, // Half of width/height for a circle
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden", // Ensure image stays within circle
  },
  profileImage: {
    width: 70,
    height: 70,

    resizeMode: "contain", // Ensure image fills the circle
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  label: {
    fontFamily: "SF Pro",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "650",

    letterSpacing: 0.96,
    color: COLORS.white,
    width: "180px",
    textAlign: "right",
  },
  valueContainer: {
    width: width > 600 ? "45%" : "50%", // 45% width on large screens, 90% on small
    maxWidth: 308, // Cap width for larger screens
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  value: {
    fontFamily: "SF Pro",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "650",

    letterSpacing: 0.96,
    color: COLORS.black,
  },
  input: {
    width: width > 600 ? "45%" : "50%", // 45% width on large screens, 90% on small
    maxWidth: 308, // Cap width for larger screens

    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    fontFamily: "SF Pro",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "650",

    letterSpacing: 0.96,
    color: COLORS.black,
  },
  actionButton: {
    width: 100,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  actionText: {
    fontFamily: "SF Pro",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "650",

    letterSpacing: 0.96,
    color: "#fff",
  },
  logoutButton: {
    width: 550,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  logoutText: {
    fontFamily: "SF Pro",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "650",

    letterSpacing: 0.96,
    color: "#fff",
  },
});
