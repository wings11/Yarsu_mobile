import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 15,
  },
  gridContainer: {
    justifyContent: "space-between",
    marginTop: 10,
    rowGap: 10,
  },
  card: {
    width: "45%",

    height: "auto",
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 10,
    marginHorizontal: 10,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    borderColor: "rgba(44, 44, 44, 0.2)",
    borderWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.background,
    flexWrap: "wrap",
    textAlignVertical: "top",
    marginLeft: 12,
    lineHeight: 18,
  },
  location: {
    fontSize: 14,
    color: COLORS.background,
    marginBottom: 30,
  },
  moreInfoButton: {
    textDecorationLine: "underline",
    color: COLORS.background,
    alignItems: "center",
  },
  closeButton: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.background,
  },
  textContainer: {
    flexDirection: "column",
    gap: 5,
    width: "90%",
    justifyContent: "flex-start", // Start content from the top
    alignItems: "flex-start",
  },
  textboxContainer: {
    marginTop: 5,
    marginLeft: 15,
    gap: 5,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Align items at the top
    width: "100%",
    justifyContent: "flex-start",
    textAlignVertical: "top",
    flexShrink: 1,
  },
  image: {
    width: 23,
    height: 23,
    alignVertical: "top",
  },
  detailsContainer: {
    paddingRight: 22,
    flexDirection: "column",
    width: "30%",
    alignItems: "flex-end",
  },
  customModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
  },
  customModalContent: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "rgba(248, 249, 250, 0.8) ",
    borderColor: "rgba(44, 44, 44, 0.2)",
    borderWidth: 1,
    padding: 23,
    width: "100%",
    alignSelf: "center",
    position: "absolute",
    top: 0,
  },
  textbox: {
    flexDirection: "row",
    width: "100%",
    margin: "auto",
    height: 60,
  },
  modalBody: {
    maxHeight: "100%",
  },
});
