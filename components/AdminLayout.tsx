import { Redirect, useRouter, usePathname } from "expo-router";
import { Text, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { styles } from "@/assets/styles/adminstyles/dashboard.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import AdminSidebar from "@/components/AdminSideBar";
import { COLORS } from "@/constants/colors";
import { LanguageProvider } from "@/context/LanguageContext";
import AccessDenied from "@/components/AccessDenied";
import { getUserRole, isAdminRole } from "@/services/authService";
import AddButton from "@/components/AddButton";
import ChatButtonAdmin from "./ChatButtonAdmin";
import MainAddButton from "@/components/mainAddButton";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const onChange = ({ window: { width } }: { window: { width: number } }) => {
      setWindowWidth(width);
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    const checkRole = async () => {
      try {
        const userData = await getUserRole();
        if (!mounted) return;
        setIsAdmin(isAdminRole(userData.role));
      } catch (e) {
        if (!mounted) return;
        setIsAdmin(false);
      }
    };
    checkRole();
    return () => {
      mounted = false;
    };
  }, []);

  if (isAdmin === null) {
    // still checking role
    return null;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateTo = (route: string) => {
    router.push(route);
    setSidebarOpen(false);
  };

  const getButtonType = () => {
    if (pathname.includes("/adminJob")) return "job";
    if (pathname.includes("/adminTravel")) return "travel";
    if (pathname.includes("/adminCondo")) return "condo";
    if (pathname.includes("/adminHotel")) return "hotel";
    if (pathname.includes("/adminRestaurant")) return "restaurant";
    if (pathname.includes("/adminCourse")) return "course";
    if (pathname.includes("/adminDoc")) return "document";
    if (pathname.includes("/adminGeneral")) return "general";
    return null;
  };

  const buttonType = getButtonType();
  const isSmallScreen = windowWidth < 600; // Threshold for small screens

  return (
    <LanguageProvider>
      <View style={styles.container}>
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={toggleSidebar}
                style={styles.sidebarTrigger}
              >
                <Ionicons name="menu" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Admin Panel,</Text>
                <Text style={styles.usernameText}>Admin</Text>
              </View>
            </View>
            <View style={styles.headerCenter}>
              <Image
                source={require("@/assets/images/YarSuLogo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerRight}>
              {buttonType && <AddButton type={buttonType} />}
            </View>
          </View>
          <View style={styles.contentContainer}>{children}</View>
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/dashboard")}
            >
              <Ionicons name="home-outline" size={40} color={COLORS.shadow} />
              {!isSmallScreen && <Text style={styles.tabText}>Dashboard</Text>}
            </TouchableOpacity>
            <View style={styles.separatorcol} />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/ChatScreenAdmin")}
            >
              <ChatButtonAdmin chatId="1" />
              {!isSmallScreen && (
                <Text style={styles.tabText}>Chat Conversation</Text>
              )}
            </TouchableOpacity>
            {isSmallScreen && <View style={styles.separatorcol} />}
            <MainAddButton />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/members")}
            >
              <Ionicons name="people-outline" size={40} color={COLORS.shadow} />
              {!isSmallScreen && <Text style={styles.tabText}>Members</Text>}
            </TouchableOpacity>
            <View style={styles.separatorcol} />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/generalsettings")}
            >
              <Ionicons
                name="settings-outline"
                size={40}
                color={COLORS.shadow}
              />
              {!isSmallScreen && (
                <Text style={styles.tabText}>General Setting</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LanguageProvider>
  );
}
