import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");
const cardWidth = 200;
const cardsPerRow = 5;
const gap = 30;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sidebarTrigger: {
    padding: 10,
  },
  welcomeContainer: {
    marginLeft: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.text,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerLogo: {
    width: 100,
    height: 40,
  },
  headerRight: {
    padding: 10,
  },
  contentContainer: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  banner: {
    width: "100%",
    height: 150,
  },
  telegramText: {
    fontSize: 14,
    color: COLORS.shadow,
    textAlign: "center",
    marginVertical: 10,
  },
  joinTele: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  iconTele: {
    marginRight: 5,
  },
  input: {
    height: 40,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  button: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 10,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: "center",
  },
  plusButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: -20,
    elevation: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
    gap: gap,
  },
  card: {
    display: "flex",
    width: cardWidth,
    height: 177,
    padding: 25,
    paddingBottom: 27,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  cardText: {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "400",
    
    letterSpacing: 0.14,
    color: COLORS.background,
    textAlign: "center",
  },
  cardTextActive: {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "400",
    
    letterSpacing: 0.14,
    color: COLORS.text,
    textAlign: "center",
  },
  cardIcon: {
    marginTop: 20,
    width: 70,
    height: 70,
    margin: "auto",
  },
});
