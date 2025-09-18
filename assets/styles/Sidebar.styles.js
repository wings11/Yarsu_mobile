import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: COLORS.background,
    padding: 16,
    flex: 1,
  },
  sidebarHeader: {
    padding: 16,
    alignItems: "center",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    width: "80%",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  sidebarContent: {
    flex: 1,
    padding: 8,
  },
  sidebarGroup: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  menuButton: {
    borderRadius: 8,
    marginBottom: 4,
  },
  activeMenuButton: {
    backgroundColor: COLORS.primary,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  activeMenuText: {
    color: COLORS.white,
  },
  logoutButton: {
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 320,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    color: COLORS.black,
    fontFamily: "SF Pro",
    fontStyle: "normal",
    fontWeight: "400",
    letterSpacing: 0.15,
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
  },
  modalButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  modalButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: "SF Pro",
    fontStyle: "normal",
    fontWeight: "400",
    letterSpacing: 0.15,

    fontWeight: "bold",
  },
});
