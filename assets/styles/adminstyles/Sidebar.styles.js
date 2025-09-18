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
    padding: 12,

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
  lanButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  logo: {
    width: 25,
    height: 25,
  },
  separatorcol: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.white,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "cover",
  },
});
