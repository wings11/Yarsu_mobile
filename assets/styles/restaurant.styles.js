import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

const windowWidth = Dimensions.get("window").width;
const numColumns = 4;
const cardMargin = 10;
const containerPadding = 0;
const cardWidth =
  (windowWidth - containerPadding * 2 - cardMargin * (numColumns + 1)) /
  numColumns;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: containerPadding,
  },
  gridContainer: {
    marginTop: 10,
    rowGap: 20,
    margin: 0,
  },
  card: {
    width: cardWidth,
    height: "auto",
    padding: 10,
    backgroundColor: "rgba(248, 249, 250, 0.80)",
    borderRadius: 12,
    margin: cardMargin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: cardWidth * 0.75, // Maintain aspect ratio (e.g., 4:3)
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  textContainer: {
    flexDirection: "column",
    padding: 5,
    gap: 2,
    width: '100%',
  },
  title: {
    fontSize: 12,
    fontWeight: "400",
    color: COLORS.black,
    fontFamily: "SF Pro",
    flexShrink: 1,
    flexWrap: 'wrap',
    includeFontPadding: false,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 5,
    margin: "auto",
  },
  logo: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%'
  },
  star: {
    fontSize: 18,
    color: COLORS.black,
    marginRight: 2,
  },
  location: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: "SF Pro",
    fontWeight: "400",
    letterSpacing: 0.12,
    lineHeight: 15,
    fontStyle: "normal",
  },
  notes: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: "SF Pro",
    fontWeight: "400",
    letterSpacing: 0.12,

    fontStyle: "normal",
    // Render notes as plain inline text — no background, no border, auto height
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    width: '100%',
    padding: 0,
    height: 'auto',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: "SF Pro",
    fontWeight: "400",
    letterSpacing: 0.12,
    fontStyle: "normal",
    marginTop: 5,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  cardTitle: {
    flexDirection: "column",
    padding: 17,
  },
  cardTitleText1: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Avenir Next",
  },
  cardTitleText2: {
    fontWeight: "600",
    fontSize: 30,
    color: COLORS.text,
    fontFamily: "Avenir Next",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    // allow modal to start lower on screen for safe area but let it use most of the screen
    paddingTop: 40,
  },
  modalContent: {
    width: "95%",
    maxHeight: "92%",
    backgroundColor: "rgba(248, 249, 250, 0.95)",
    borderRadius: 12,
    padding: 16,
    alignItems: "stretch",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.black,
  },
  modalImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  modalImage: {
    width: "75%",
    height: 200,
    borderRadius: 8,
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
    color: COLORS.black,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.black,
  },
  modalDetails: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Avenir Next",
    marginBottom: 10,
    textAlign: "center",
  },
  modalRatingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  modalIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 2,
  },
  modalDetailText: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "SF Pro",
    fontWeight: "400",
  },
  iconClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'transparent'
  },
  modalMediaContainer: {
    width: '100%',
    paddingTop: 12,
  }
});
