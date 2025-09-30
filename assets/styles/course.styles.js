import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 15,
  },
  gridContainer: {
    justifyContent: "flex-start",
    marginTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  card: {
    width: "100%",
    alignSelf: "stretch",
    height: "auto",
    padding: 14,
    paddingRight: 18, // give some extra right padding so right-most text isn't clipped
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 10,
    marginHorizontal: 0,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    borderColor: "rgba(44, 44, 44, 0.2)",
    borderWidth: 1,
    overflow: 'visible', // ensure text isn't clipped by rounded corners
  },
  title: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.text,
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
    width: "100%",
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
    paddingRight: 8,
    flexDirection: "column",
    width: "40%",
    alignItems: "flex-start",
  },
  customModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
  },
  customModalOverlayDev: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    display: "flex",
    pointerEvents: 'none',
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
    // Make this relative so the overlay's justifyContent controls placement
    position: "relative",
  },
  textbox: {
    flexDirection: "row",
    width: "100%",
    margin: "auto",
    // allow variable height so long text wraps and is visible
    minHeight: 40,
    paddingVertical: 6,
  },
  modalBody: {
    maxHeight: "100%",
    paddingBottom: 12,
  },
  /* new styles used by updated Course component */
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.08)',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 20,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: COLORS.gray,
  },
  cardMeta: {
    flex: 1,
    paddingRight: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: '#111111', // force high-contrast title color (overrides theme if needed)
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#4a4a4a', // ensure subtitle/duration is visible against white card
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#111111',
    flexShrink: 1,
    paddingHorizontal: 6,
  }
});
